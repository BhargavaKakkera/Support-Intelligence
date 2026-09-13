import re

class ResolutionExtractor:
    def __init__(self):
        self.common_patterns = [
            (re.compile(r'(?i)(DM|direct message|private message)'), "REQUEST_DM_FOR_DETAILS"),
            (re.compile(r'(?i)(http|link|url)'), "PROVIDE_HELP_LINK"),
            (re.compile(r'(?i)(sorry|apologize|apologies)'), "ISSUE_APOLOGY"),
            (re.compile(r'(?i)(refund|money back|return)'), "DISCUSS_REFUND_RETURN"),
            (re.compile(r'(?i)(update|check the status|track)'), "CHECK_STATUS_OR_TRACKING"),
            (re.compile(r'(?i)(call|phone|speak)'), "REQUEST_PHONE_CALL")
        ]
        
    def extract(self, retrieved_examples):
        if not retrieved_examples:
            return "NO_PRECEDENT"
            
        actions = set()
        
        for convo in retrieved_examples:
            for msg in convo['messages']:
                if msg['role'] == 'support':
                    text = msg['text']
                    for pattern, action in self.common_patterns:
                        if pattern.search(text):
                            actions.add(action)
                            
        if not actions:
            return "PROVIDE_GENERAL_ASSISTANCE"
            
        return ", ".join(sorted(list(actions)))
