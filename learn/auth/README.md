# Authentication Documentation

This section explains how users are securely logged in and authenticated.

## 1. The Core Technology: JWT (JSON Web Tokens)
Instead of using traditional cookies/sessions where the server has to remember who is logged in, we use JWT. 

**How it works:**
1. You give the server your username and password.
2. The server says, "Yes, you are Darshan." It creates a mathematically signed string (the JWT) that basically says "I, the Server, guarantee this person is User #123. Signed: Server."
3. It hands this token to the frontend.
4. The server immediately *forgets* you. It is "stateless".
5. Next time you want your bookings, you hand that token back to the server.
6. The server checks the signature. If the signature is valid, it knows you are User #123 without having to look you up in a session database.

## 2. Token Storage & Login Persistence
When the React frontend receives the token, it saves it in `localStorage`.
`localStorage.setItem('token', token)`

- **Why `localStorage`?** It survives page refreshes and closing the browser.
- **Login Persistence:** When you open the app tomorrow, React checks `localStorage`. If it finds a token, it assumes you are still logged in and skips the login screen.
- **Logout:** Logging out is as simple as deleting the token from `localStorage`: `localStorage.removeItem('token')`.

## 3. Middleware Logic (`authMiddleware.js`)
This is the bouncer at the club door.

Whenever a frontend request tries to access a protected route (like creating a booking):
1. The Express route passes the request to `authMiddleware`.
2. The middleware looks for the `Authorization` header.
3. If missing, it returns `401 Not Authorized`.
4. If present, it uses the `jsonwebtoken` library to verify the token using your secret `JWT_SECRET` stored in `.env`.
5. If the token is fake or expired, it returns `401`.
6. If valid, it extracts the `userId` from the token, attaches it to the `req` object (`req.user = decoded`), and lets the request into the club (the controller).

## 4. Security Risks & Best Practices
- **Never store passwords in plain text.** We use `bcryptjs` to hash them before saving to MongoDB.
- **XSS (Cross-Site Scripting):** Because we store the token in `localStorage`, a malicious script injected into our site could steal it. A more secure (but harder to implement) method is storing tokens in `HttpOnly` cookies.
- **Keep `JWT_SECRET` safe:** If anyone discovers the secret string in your `.env` file, they can forge tokens and become any user, including an Admin.
