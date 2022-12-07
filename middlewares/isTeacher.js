export default function isTeacher(req, res, next){
    const user = req.currentUser

    if (user.role!== "TEACHER"){
        return res.status(401).json({msg: "User is not a teacher"})
    }
    next()
}
// 1.05/00