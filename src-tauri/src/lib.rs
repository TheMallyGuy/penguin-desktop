use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use tauri::webview::PageLoadEvent;
use tauri::Emitter;
use tauri::Manager;

struct PendingFile {
    path: String,
}

const PM_UPLOAD_BRIDGE_PORT: u16 = 17421;

#[derive(Clone)]
struct PmUploadPayload {
    title: String,
    project_data_url: String,
    thumbnail_data_url: Option<String>,
}

#[derive(Default)]
struct PmUploadState(Mutex<Option<PmUploadPayload>>);

#[derive(Default)]
struct PmUploadBridgeReady(AtomicBool);

fn start_pm_upload_bridge_server(app: tauri::AppHandle) {
    // bind to some port
    let server = match tiny_http::Server::http(("127.0.0.1", PM_UPLOAD_BRIDGE_PORT)) {
        Ok(server) => server,
        Err(e) => {
            eprintln!("failed to start pm-upload bridge server: {}", e);
            return;
        }
    };

    app.state::<PmUploadBridgeReady>()
        .0
        .store(true, Ordering::SeqCst);

    std::thread::spawn(move || {
        for request in server.incoming_requests() {
            let (status, content_type, body): (u16, &str, String) = match request.url() {
                "/" | "/bridge.html" => (
                    200,
                    "text/html; charset=utf-8",
                    include_str!("pm_upload_bridge.html").to_string(),
                ),
                "/project" => {
                    // consume on read so a reloaded/duplicated tab doesn't keep re-serving a stale project indefinitely.
                    let state = app.state::<PmUploadState>();
                    let payload = state.0.lock().unwrap().take();
                    match payload {
                        Some(p) => (
                            200,
                            "application/json",
                            serde_json::json!({
                                "title": p.title,
                                "dataUrl": p.project_data_url,
                                "thumbnailDataUrl": p.thumbnail_data_url,
                            })
                            .to_string(),
                        ),
                        None => (404, "text/plain", "no project queued".to_string()),
                    }
                }
                _ => (404, "text/plain", "not found".to_string()),
            };

            let content_type_header =
                tiny_http::Header::from_bytes(&b"Content-Type"[..], content_type.as_bytes())
                    .unwrap();
            let cache_control_header =
                tiny_http::Header::from_bytes(&b"Cache-Control"[..], &b"no-store"[..]).unwrap();
            let response = tiny_http::Response::from_string(body)
                .with_status_code(status)
                .with_header(content_type_header)
                .with_header(cache_control_header);
            let _ = request.respond(response);
        }
    });
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    tauri_plugin_opener::open_url(&url, None::<&str>).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file(file: String) -> Result<Vec<u8>, String> {
    std::fs::read(file).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(file: String, contents: Vec<u8>) -> Result<(), String> {
    std::fs::write(file, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn open_pm_upload(
    state: tauri::State<PmUploadState>,
    bridge_ready: tauri::State<PmUploadBridgeReady>,
    title: String,
    project_data_url: String,
    thumbnail_data_url: Option<String>,
) -> Result<(), String> {
    if !bridge_ready.0.load(Ordering::SeqCst) {
        return Err("pm-upload bridge server failed to start".to_string());
    }

    *state.0.lock().unwrap() = Some(PmUploadPayload {
        title,
        project_data_url,
        thumbnail_data_url,
    });

    tauri_plugin_opener::open_url(
        format!("http://localhost:{PM_UPLOAD_BRIDGE_PORT}/"),
        None::<&str>,
    )
    .map_err(|e| e.to_string())
}

const OWNED_WINDOW_LABELS: [&str; 4] = [
    "main",
    "packager-win",
    "addons-settings",
    "desktop-settings",
];

fn read_baked_js(filename: &str, prod_fallback: &'static str) -> std::borrow::Cow<'static, str> {
    if cfg!(debug_assertions) {
        let dev_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("src")
            .join("baked_js")
            .join(filename);
        if let Ok(content) = fs::read_to_string(&dev_path) {
            return std::borrow::Cow::Owned(content);
        }
    }
    std::borrow::Cow::Borrowed(prod_fallback)
}

fn inject_js_files(webview: &tauri::Webview) {
    let content = read_baked_js("script.js", include_str!("baked_js/script.js"));

    if let Err(e) = webview.eval(&*content) {
        eprintln!("failed to eval baked script: {}", e);
    } else {
        println!("injected baked script");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_drpc::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(PmUploadState::default())
        .manage(PmUploadBridgeReady::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            open_external,
            read_file,
            write_file,
            open_pm_upload
        ])
        .on_page_load(|webview, payload| {
            if !OWNED_WINDOW_LABELS.contains(&webview.label()) {
                return;
            }

            if payload.event() == PageLoadEvent::Started {
                // inject early
                if webview.label() == "packager-win" {
                    inject_js_files(webview);
                }
                return;
            }

            if payload.event() != PageLoadEvent::Finished {
                return;
            }

            inject_js_files(webview);

            if let Some(pending) = webview.try_state::<PendingFile>() {
                let path = pending.path.clone();
                let webview_label = webview.label().to_string();
                let app_handle = webview.app_handle().clone();
                std::thread::spawn(move || {
                    //std::thread::sleep(std::time::Duration::from_secs(1));
                    let webview = app_handle.get_webview_window(&webview_label).unwrap();
                    if let Err(e) = webview.emit("file-open-pmp", path) {
                        eprintln!("failed to emit file-open-pmp: {}", e);
                    }
                });
            }
        })
        .setup(|app| {
            start_pm_upload_bridge_server(app.handle().clone());

            let args: Vec<String> = std::env::args().collect();

            if let Some(file_path) = args.get(1) {
                println!("opened with file: {}", file_path);

                app.manage(PendingFile {
                    path: file_path.clone(),
                });
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, _event| {});
}
