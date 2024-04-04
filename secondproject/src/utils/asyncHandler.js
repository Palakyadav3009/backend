
// asynchandler is used for checking web req handling
//async is ineternal method


//const asyncHandler = ()=>{}
//const asyncHandler = (func)=>{()=>{}} 
//const asyncHandler = (func)=>()=>{}
//function k andr function
//const asyncHandler = (func)=>async()=>{}


// 1st 

// const asyncHandler = (func) =>async(req,res,next)=> {
//     try {
//         await func(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message: err.message
//         })
        
//     }
 
// }





//in promise way

const asyncHandler =(requestHandler) =>{
  return  (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export  {asyncHandler}
