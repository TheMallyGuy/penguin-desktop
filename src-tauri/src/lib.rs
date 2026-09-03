use std::fs;
use std::path::PathBuf;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    tauri_plugin_opener::open_url(&url, None::<&str>).map_err(|e| e.to_string())
}

fn inject_js_files(webview: &tauri::Webview) {
    let mut backed_js_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    backed_js_dir.push("src");
    backed_js_dir.push("baked_js");

    if !backed_js_dir.exists() {
        return;
    }

    let mut entries: Vec<_> = fs::read_dir(&backed_js_dir)
        .expect("failed to read baked_js directory")
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "js"))
        .collect();

    entries.sort_by_key(|e| e.path());

    for entry in entries {
        let path = entry.path();
        let content = fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("failed to read {}: {}", path.display(), e));
        if let Err(e) = webview.eval(&content) {
            eprintln!("failed to eval {}: {}", path.display(), e);
        } else {
            println!("injected {}", path.display());
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, open_external])
        .on_page_load(|webview, _event| {
            inject_js_files(webview);
        })
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
