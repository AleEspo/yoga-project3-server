export default function isAdmin(req, res, next){
    const user = req.currentUser

    if (user.role!== "ADMIN"){
        return res.status(401).json({msg: "User is not Admin"})
    }
    next()
}
// 1.05/00