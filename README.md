<img src="https://github.com/user-attachments/assets/7f78566f-140a-4af0-a75a-e43e66c90aa4" alt="hawklogo512" width="100">

# HawkClient
HawkClient is a powerful tool designed to test APIs and manage collections and requests with ease. It stores the collections and requests as YAML files on your local file system, making it convenient to organize, reuse, and share your API tests.

- **Mock Server**: Create and run a mock server to simulate API responses without relying on live endpoints (by default it will run on localhost:3001 if that port is occupied it will try ports till 3010).
- **REST, GraphQL (GQL), gRPC Support**: Test RESTful APIs, GraphQL queries/mutations and gRPC requests.
- **Validations and Tests**: Write and run validations and tests to ensure API responses meet expected criteria.
- **Scripts (Request and Collection Level)**: Automate workflows with scripts that can be executed at both the request and collection levels.
- **Environments**: Manage different environments (e.g., development, staging, production) and switch between them effortlessly.
- **Variables**: Use variables at the environment, collection, and request levels to dynamically manage and manipulate data.
- **Collection Runner**: Execute a series of API requests organized into collections.
- **Flow Creation**: Design and execute complex flows that involve multiple API calls, with conditional logic and branching.
- **Pre-request and Post-response Hooks**: Customize API calls with scripts that run before a request is sent or after a response is received.
- **Code Snippet Generation**: Automatically generate code snippets for API requests in various programming languages.
- **Swagger/OpenAPI Support**: Import and manage Swagger/OpenAPI specifications at the collection level for comprehensive API documentation and testing.
- **File System Storage**: Store collections and requests on the filesystem in YAML format, making it easy to collaborate through version control systems like GitHub.
- **Custom Node Modules**: Install node modules inside collection folders, which can be accessed in the scripts of that collection.
- **File Explorer**: Use the built-in file explorer to create and manage script files directly within the tool.
- **Source Control**: "Source Control" tab is added to the interface, allowing you to see the Git changes in your collection files, similar to how changes are viewed in Visual Studio Code (VSCode). This makes it easier to manage and track changes directly from the application. 

# hawkClient light-theme
<img width="1526" height="782" alt="Light" src="https://github.com/user-attachments/assets/4d16f386-aae7-427a-8ded-bb5dea348722" />





# hawkClient dark-theme
<img width="1524" height="783" alt="Dark" src="https://github.com/user-attachments/assets/2474faac-0cf2-431e-8aa1-f4ae7ec813a6" />



## API Flows
<img width="1490" height="797" alt="APIFlows" src="https://github.com/user-attachments/assets/552c861f-0f10-4032-9026-dc282d024059" />



[API Flows Demo](https://youtu.be/9IqkVy_3iXc)


## 🖥 Installing the App  

You can download the latest version of HawkClient from the official website:  

➡️ [Download HawkClient](https://www.hawkclient.com/download)  



## Demo Video
[hawkClient Demo](https://youtu.be/fu8xDSnUoIU?si=HF3_0gbY0L5FiBpl)

[API Flows Demo](https://youtu.be/9IqkVy_3iXc)

## Git Collaboration
- HawkClient stores the requests in **yaml files** that makes it more readable and easier to share with team through git

<img width="1329" alt="Screenshot 2025-03-02 at 1 21 36 PM" src="https://github.com/user-attachments/assets/ac808a56-2ada-45b6-8ac0-6e2882f07509" />

## License

The source code in this repository is licensed under the **MIT License**.

⚠️ Please note: the **built binaries/distributed application** are covered by a **separate license**, available here:  
- [HawkClient Terms of Use](https://www.hawkclient.com/terms)