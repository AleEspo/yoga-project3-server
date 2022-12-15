export default function isTeacher(req, res, next){
    const user = req.currentUser
    const teacher = req.teacher

    if (user.role=== "TEACHER"){
        if(user === teacher){
            next()
        }
        return res.status(401).json({msg: "This practice was created by another teacher"})
    }
    return res.status(401).json({msg: "User is not a teacher"})
}