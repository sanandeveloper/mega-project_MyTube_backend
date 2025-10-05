//   const asyncHandler=(requesthandler)=> (req,res,next)=>{

//     try {
//         requesthandler(req,res,next)
//     } catch (error) {
//         console.log('error occured',error)

//     }

//   }

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export { asyncHandler };



// let firstNumber=10
// let secondNumber=20
// function sum(a,b) {
//   return a+b
// }

// sum(firstNumber,secondNumber)



