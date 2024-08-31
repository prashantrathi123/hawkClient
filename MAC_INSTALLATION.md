This app is not notarized yet due to that reason once this app is opened on mac user might see below error.

<img width="575" height="575" alt="Screenshot 2024-08-31 at 6 20 46 AM" src="https://github.com/user-attachments/assets/7f73bcd7-1cca-44f4-90ab-df22e8d498b7">

**Solution**: to resolve this issue user have to enable "Anywhere" option that allows to install app that are not yet notarised. To do this user can execute the below command in terminal

```bash
   sudo spctl --master-disable
```
After this the "Anywhere" option will be selected as shown below

<img width="735" alt="Screenshot 2024-08-31 at 6 22 48 AM" src="https://github.com/user-attachments/assets/a79f22ab-7077-48cc-94fd-6aec5275283b">

Now user can open the app it will show a warning user can click on open. This activity is one time and user can use the app afterwards without any issues

<img width="763" alt="Screenshot 2024-08-31 at 6 23 11 AM" src="https://github.com/user-attachments/assets/179dbbee-a3fd-4be9-b6b3-1e6d74cf7423">
