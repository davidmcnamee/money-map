import json
import datetime

transaction_files = ['TD-World-BankTransactions-v2.0-1_results.json', 'TD-World-BankTransactions-v2.0-1212_results.json', 'TD-World-BankTransactions-v2.0-1213_results.json']
cust_files = ['TD-World-Bank-v2.0-1_results.json', 'TD-World-Bank-v2.0-1212_results.json', 'TD-World-Bank-v2.0-1213_results.json']

date_time_format = '%Y-%m-%dT%H:%M:%S'

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
            return o.__dict__   


class Account:
    def __init__(self, json):
        self.id = json['id']
        customers = json['relatedCustomers']
        if 'authorized' in customers:
            self.cust_id = json['relatedCustomers']['authorized'][0]['customerId']
        elif 'individual' in customers:
            self.cust_id = json['relatedCustomers']['individual'][0]['customerId']

def valid_transaction(json):
    if transaction_json.get('type') == 'Debit' or transaction_json.get('source') == 'POS':
        return 'merchantName' in json and 'locationLatitude' in json and 'locationLongitude' in json

class Transaction:
    def __init__(self, json):
        #customer reference
        self.customer = None
        self.amount = json['currencyAmount']
        self.desc = json['description']
        self.merch_name = json['merchantName']
        date_time_str = json['originationDateTime']
        #remove everything past the hour
        self.date_time = date_time_str[0:date_time_str.rfind('T') + 3]
        #guaranteed to exist
        self.lat_long = (json['locationLatitude'], json['locationLongitude'])
        #location data, may not exist, this is the front-end people's job
        self.city = json.get('locationCity')
        self.country = json.get('locationCountry')
        self.street = json.get('locationStreet')
        self.region = json.get('locationRegion')
        
accounts = dict()
transactions = dict()

for file_name in transaction_files:
    with open(f'raw_data/{file_name}', 'r') as file:
        file_json = json.load(file)
        print(f'Loaded {file_name}')
        for account_json in file_json:
            account = Account(account_json)
            accounts[account.cust_id] = account
            for transaction_json in account_json['transactions']:
                if (valid_transaction(transaction_json)):
                    transaction = Transaction(transaction_json)
                    transaction.customer = account.cust_id
                    if transaction.date_time not in transactions:
                        transactions[transaction.date_time] = list()
                    transactions[transaction.date_time].append(transaction)

for file_name in cust_files:
    with open(f'raw_data/{file_name}', 'r') as file:
        file_json = json.load(file)
        for customer_json in file_json['customers']:
            if customer_json['id'] in accounts:
                account = accounts[customer_json['id']]
                person = customer_json['citizen']['person']
                account.surname = person['surname']
                account.first_name = person['givenName']
                account.age = person['age']

with open('data/td_accounts.json', 'w') as accounts_file:
    json.dump(accounts, accounts_file, cls=CustomJSONEncoder)

print('Account file written.')

#bin transactions into months to avoid getting a giant file

binned_transactions = dict()

for k, v in transactions.items():
    month = k[0:7]
    if month not in binned_transactions:
        binned_transactions[month] = dict()
    binned_transactions[month][k] = v

for k, v in binned_transactions.items():
    with open(f'data/td_transaction_{k}.json', 'w') as transaction_file:
        json.dump(v, transaction_file, cls=CustomJSONEncoder)
    print(f'Transactions written for {k}')

print('Processing complete.')