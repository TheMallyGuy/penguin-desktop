fn main() {
    tauri_helper::generate_command_file(tauri_helper::TauriHelperOptions::new(true));
    tauri_build::build()
}
