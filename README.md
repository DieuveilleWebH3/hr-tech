# Introduction #
This document provides the instructions for using the **HR TECH** Application
The HR TECH App is a Django-based Software for IT recruiters to keep track of job applications ... and much more.
It allows multiple type users management, ...
The Account Module is based on the CRUD user interface convention.  



# Document #

## Target audience ##

This document is targeted (but not limited) to technical individual with a Web Development (Django) background 


## Definition ##


 



# Application components #

 


## 3.1 Starting New Project ##   
 





## 3.2 Using Account Module as Base ## 





## 3.3 Password Reset Server Configuration ## 

**In setting.py:** mysite/settings.py  

We need to configure the server to be able to send emails for the reset / recover password functionality.  

An example with gmail smtp server configuration  

We add at the bottom of settings.py  

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend" 

EMAIL_USE_TLS = True 

EMAIL_HOST = 'smtp.gmail.com' 

EMAIL_PORT = 587 

EMAIL_HOST_USER = 'john-doe@gmail.com' 

EMAIL_HOST_PASSWORD = 'JohnDoePassword' 

This uses the john doe gmail account to send emails to users wanting to recover their passwords (you have to modify the gmail settings to enable and allow less secure third app to use this feature) 

We can also test the functionality on our local server, by replacing (or commenting) all of the above by    

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' 

This will show the email in our terminal.

