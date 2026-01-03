class SystemInterface:
    def load_settings(self):
        self.setting.load()
        self.setting.load_api_list()

    def save_settings(self):
        self.setting.save()

    def process_add_api(self):
        self.setting.add_api_key()

    def process_delete_api(self):
        self.setting.delete_api_key()

    def process_select_api(self):
        self.setting.handle_select()
    
    def process_check_usage(self):
        self.setting.check_api_usage()    

    def refresh_all_lists(self):
        self.refresh.refresh_all()
