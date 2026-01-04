# handler/detail.py
from app.path_service import SubtitlePathService
from .steps.split_step import SplitStep
from .steps.translate_step import TranslateStep
from .steps.combine_step import CombineStep

class Detail:
    def __init__(self, handler):
        self.handler = handler
        self.path_service = SubtitlePathService(handler.path)
        
        # 담당자들을 각각 생성하여 할당
        self.split_step = SplitStep(handler, self.path_service)
        self.translate_step = TranslateStep(handler, self.path_service)
        self.combine_step = CombineStep(handler, self.path_service)

    # 단순 연결 (Delegation)
    def handle_split(self):
        self.split_step.execute()

    def handle_translate(self):
        self.translate_step.execute_translate()

    def handle_test(self):
        self.translate_step.execute_test()

    def handle_combine_parts(self):
        self.combine_step.execute_parts()

    def handle_combine_timeline(self):
        self.combine_step.execute_timeline()