# Secure Flask Bootstrap PWA Template
This Flask template has been built from the ground up to be a secure Progressive Web App. It includes a secure form and Bootstrap sample components ready to be connected to a SQLite3 database. The PWA standards have been integrated, and placeholder images have been provided for all the icon and image components.

# Dependencies
* VSCode or GitHub Codespaces (preconfigured for docker)
* Python 3+
* pip install Flask
* pip install SQLite3
* pip install bcrypt
* pip install flask_wtf

## To be implemented by developers
* Web content, [Bootstrap](https://getbootstrap.com/) ready
* [SQLite](https://docs.python.org/3/library/sqlite3.html) database design and integration
* Input sanitisation
* Login, authentication or session management
* Password encryption using [bcrypt](https://pypi.org/project/bcrypt/)
* SSL Encryption

> [!TIP]
> ## Content Security Policy (CSP) note
> Content-Security-Policy is the name of an HTTP response header that modern browsers use to enhance the security of the app. The Content-Security-Policy header allows you to restrict which resources (such as JavaScript, CSS, Images, etc.) can be loaded, and the URLs that they can be loaded from.  
> Although it is best applied as an HTTP response header, this template has applied it as a meta tag, which is the minimum standard.

> [!WARNING]
> * Bootstrap 5.3.3 has been packaged in the template, developers should [monitor for discovered vulnerabilities](https://security.snyk.io/package/npm/bootstrap) and patch or update as needed.
