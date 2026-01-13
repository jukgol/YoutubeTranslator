import time
import os
from ui import selectors
from youtubetranslator.path import paths
from ui.listtap.simple import render_queue_to_widget 

class Simple:
    def __init__(self):
        # 이제 초기화 시 위젯이 필요 없습니다. 핸들러보다 먼저 생성되어도 안전합니다.
        self.queue = []  
        self.current_index = -1 
        self.tab = None

    def refresh_ui(self, widget):
        """데이터를 들고 UI 렌더링 함수를 호출만 합니다."""        
        render_queue_to_widget(widget, self.queue, self.current_index)

    def add(self, filename, widget):
        """큐에 추가하고 화면 갱신"""
        if filename and filename not in self.queue:
            self.queue.append(filename)
            self.refresh_ui(widget)
            return True
        return False

    def handle_add(self, tab, log_callback):
        """위젯에서 항목을 추출하여 추가 프로세스 진행"""        
        filename = selectors.get_pure_filename(tab.origin_list)
        
        if not filename:
            log_callback("⚠️ 추가할 파일을 원본 리스트에서 선택해주세요.")
            return

        if filename and filename not in self.queue:
            self.queue.append(filename)
            # 갱신할 때도 tab.queue_list를 사용하도록 전달
            self.refresh_ui(tab.queue_list) 
            log_callback(f"➕ 추가됨: {filename}")
        else:
            log_callback(f"ℹ️ 이미 큐에 존재합니다: {filename}")

    def clear(self, tab):
        self.queue = []
        self.current_index = -1
        # tab.queue_list 위젯을 닦아냅니다.
        self.refresh_ui(tab.queue_list)

    def run_test_loop(self, widget, log_callback, is_stopped_func):
        """테스트 루프 실행 (위젯을 인자로 받아 매번 갱신)"""
        self.current_index = -1
        for i in range(len(self.queue)):
            if is_stopped_func():
                log_callback("🛑 [테스트] 루프 중단.")
                break
            
            self.current_index = i
            self.refresh_ui(widget) # 현재 인덱스가 반영된 상태로 다시 그리기 요청
            
            filename = self.queue[i]
            log_callback(f"🧪 [테스트] {i+1}/{len(self.queue)}: {filename} 처리 중...")
            time.sleep(2)
            
        log_callback("🏁 [테스트] 루프 종료.")
        self.current_index = -1
        self.refresh_ui(widget)


    def handle_copy_file(self, tab, path, refresh_handler, log_callback):
        """
        4번 결과 리스트에서 선택된 파일을 Video 폴더로 실제로 복사합니다.
        """ 
        # 1. 파일명 추출
        filename = tab.result_list.get_selected()
    
        if not filename:
            log_callback("⚠️ 복사할 파일을 결과 리스트에서 선택해주세요.")
            return

        # 2. 경로 설정
        source_path = os.path.join(path.result_final_dir, filename)
        target_dir = path.video_dir

        # 3. path_service의 복사 함수 호출 (move -> copy)
        from youtubetranslator.path_service import copy_file_to_folder
        success, message = copy_file_to_folder(source_path, target_dir)

        # 4. 결과 처리
        if success:
            log_callback(f"✅ 복사 완료: {filename} -> Video 폴더")
            # 복사는 원본이 남아있으므로 리스트 새로고침이 필수는 아니지만, 
            # 혹시 모를 상태 반영을 위해 그대로 두셔도 됩니다.
            # refresh_handler.refresh_all() 
        else:
            log_callback(f"❌ 복사 실패: {message}")


    def update_file_list_widget(self, widget, folder_path):
        """특정 폴더의 파일 목록을 읽어 SmartListPanel에 채웁니다."""
        if not os.path.exists(folder_path):
            return
            
        # 1. 폴더 내 파일 목록 가져오기
        try:
            files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
            files.sort() # 가나다순 정렬
        except Exception as e:
            print(f"폴더 읽기 오류: {e}")
            return

        # 2. SmartListPanel에 내장된 set_list 함수 사용
        # widget(SmartListPanel)이 이미 가지고 있는 기능을 활용합니다.
        widget.set_list(files)

    def initialize_tab_lists(self, tab):
        """앱 시작 시 UI 객체를 등록하고 3개의 리스트를 최신화합니다."""
        self.tab = tab       
        
        # 초기화 시 3개 리스트 갱신
        self.refresh_origin()
        self.refresh_result()
        self.refresh_queue()

    def refresh_all(self):
        self.refresh_origin()
        self.refresh_result()
        self.refresh_queue()

    # --- 3개 리스트별 전용 호출 함수 (파라미터 없음) ---

    def refresh_origin(self):
        """1. 원본 리스트 갱신 (origin_dir -> origin_list)"""
        if self.tab:
            self.update_file_list_widget(self.tab.origin_list, paths.origin_dir)

    def refresh_result(self):
        """2. 결과 리스트 갱신 (result_final_dir -> result_list)"""
        if self.tab:
            self.update_file_list_widget(self.tab.result_list, paths.result_final_dir)

    def refresh_queue(self):
        """3. 큐 리스트 갱신 (handler 내부 queue -> queue_list)"""
        if self.tab:
            # 큐는 폴더가 아니므로 기존에 만드신 refresh_ui를 활용합니다.
            self.refresh_ui(self.tab.queue_list)