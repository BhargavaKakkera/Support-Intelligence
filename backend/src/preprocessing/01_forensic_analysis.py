import pandas as pd
import os
import json

def analyze_dataset(file_path):
    print(f"Loading dataset from {file_path}...")
    df = pd.read_csv(file_path)
    
    report = []
    report.append("# Data Quality & Forensic Analysis Report")
    report.append(f"**Total rows:** {len(df):,}")
    report.append(f"**Total columns:** {len(df.columns)}")
    report.append(f"**Columns:** {', '.join(df.columns)}")
    
    report.append("\n## Missing Values")
    missing = df.isnull().sum()
    for col, count in missing.items():
        if count > 0:
            report.append(f"- {col}: {count:,} ({count/len(df)*100:.2f}%)")
            
    report.append("\n## Data Types & Identifiers")
    report.append(f"- Unique tweet IDs: {df['tweet_id'].nunique():,}")
    report.append(f"- Unique authors: {df['author_id'].nunique():,}")
    
    inbound_count = df['inbound'].sum()
    outbound_count = len(df) - inbound_count
    report.append(f"\n## Directionality")
    report.append(f"- Inbound (Customer) messages: {inbound_count:,} ({inbound_count/len(df)*100:.2f}%)")
    report.append(f"- Outbound (Brand) messages: {outbound_count:,} ({outbound_count/len(df)*100:.2f}%)")
    
    # Analyze Brands (Outbound messages)
    brands = df[df['inbound'] == False]['author_id'].value_counts()
    report.append(f"\n## Brands")
    report.append(f"- Total unique brands: {len(brands)}")
    report.append(f"- Top 10 brands by response volume:\n")
    for brand, count in brands.head(10).items():
        report.append(f"  - {brand}: {count:,}")
        
    # Analyze Threading / Conversations
    # 'response_tweet_id' and 'in_response_to_tweet_id' are used to link
    has_in_response = df['in_response_to_tweet_id'].notnull().sum()
    has_responses = df['response_tweet_id'].notnull().sum()
    
    report.append(f"\n## Conversation Linking")
    report.append(f"- Tweets that are replies (in_response_to): {has_in_response:,} ({has_in_response/len(df)*100:.2f}%)")
    report.append(f"- Tweets that have replies (response_tweet_id): {has_responses:,} ({has_responses/len(df)*100:.2f}%)")
    
    # Save the report
    os.makedirs("reports", exist_ok=True)
    report_text = "\n".join(report)
    with open("reports/01_forensic_report.md", "w") as f:
        f.write(report_text)
        
    print("Forensic analysis complete. Report saved to reports/01_forensic_report.md")

if __name__ == "__main__":
    analyze_dataset("../data/raw/twcs.csv")
