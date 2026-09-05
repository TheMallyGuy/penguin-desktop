use std::fs;
use std::path::PathBuf;
use tauri::webview::PageLoadEvent;
use tauri::Emitter;
use tauri::Manager;

struct PendingFile {
    path: String,
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

fn inject_js_files(webview: &tauri::Webview) {
    let content: std::borrow::Cow<'static, str> = if cfg!(debug_assertions) {
        let dev_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("src")
            .join("baked_js")
            .join("script.js");
        if let Ok(file_content) = fs::read_to_string(&dev_path) {
            std::borrow::Cow::Owned(file_content)
        } else {
            std::borrow::Cow::Borrowed(include_str!("baked_js/script.js"))
        }
    } else {
        std::borrow::Cow::Borrowed(include_str!("baked_js/script.js"))
    };

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
        .invoke_handler(tauri::generate_handler![greet, open_external, read_file, write_file])
        .on_page_load(|webview, payload| {
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
