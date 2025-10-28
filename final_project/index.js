const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    const { username, password } = req.body;

    // 1) Проверка наличия полей
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // 2) Аутентификация пользователя
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid login. Check username and password" });
    }
  
    // 3) Генерация JWT (НЕ кладём пароль в payload)
    const accessToken = jwt.sign(
      { sub: username },          // или { user: username }
      "access",                   // секрет ДОЛЖЕН совпадать с verify в middleware
      { expiresIn: 60 }           // 60 секунд (для проверки истечения)
    );
  
    // 4) Сохраняем в сессию
    req.session.authorization = { accessToken, username };
  
    return res.status(200).json({ message: "User successfully logged in" });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
