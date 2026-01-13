from youtubetranslator.path import paths
from youtubetranslator.app.setting_service import SettingService
from youtubetranslator.handler.simple import Simple
import os

print('base_dir:', paths.base_dir)
print('data dirs exist:')
for d in paths.all_dirs:
    print(' ', d, os.path.exists(d))

s = SettingService(paths)
keys = s.read_api_keys()
print('api keys count:', len(keys))

# Stub widget with set_list implementation
class StubWidget:
    def __init__(self):
        self.last_set = None
        self.cleared = False
    def set_list(self, items):
        self.last_set = items
    def clear(self):
        self.cleared = True
    def add(self, text, color=None):
        # For queue rendering, collect added lines
        if self.last_set is None:
            self.last_set = []
        self.last_set.append(text)
    def update(self):
        pass

# Test Simple refresh functions
simple = Simple()
stub = StubWidget()
# refresh_origin uses paths.origin_dir
simple.update_file_list_widget(stub, paths.origin_dir)
print('origin list count:', len(stub.last_set) if stub.last_set is not None else 'no set')

simple.update_file_list_widget(stub, paths.result_final_dir)
print('result list count:', len(stub.last_set) if stub.last_set is not None else 'no set')

# test initialize_tab_lists which calls refresh_* methods
class Tab:
    def __init__(self):
        self.origin_list = StubWidget()
        self.result_list = StubWidget()
        self.queue_list = StubWidget()

    def get_selected(self):
        return None

tab = Tab()
simple.initialize_tab_lists(tab)
print('tab.origin_list last_set:', len(tab.origin_list.last_set) if tab.origin_list.last_set else 0)
print('tab.result_list last_set:', len(tab.result_list.last_set) if tab.result_list.last_set else 0)
print('tab.queue_list last_set:', tab.queue_list.last_set)

print('Smoke tests completed successfully')