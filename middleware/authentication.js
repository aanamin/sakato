const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // ambil token setelah "Bearer"
    console.log("token", token);
    
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "token kadaluarsa"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decoded);
        
        req.id_user = decoded.id_user;
        req.user = decoded.role // simpan payload token ke request
        next()

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error"
        });
    }
};

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user
        console.log(user);
        
      const role = req.user
      console.log("Role", role);
      
    console.log("Allowed", allowedRoles); // <- Debug juga ini
      
  
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Akses ditolak, role tidak sesuai' })
      }
  
      next()
    }
}



module.exports = {
    verifyToken,
    checkRole
}