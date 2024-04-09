nums = [1,2,0]
var firstMissingPositive = function(nums) {
    let a = nums.sort((a,b)=>a-b)
    console.log(a)
    for(let i =1; i<(nums.length*nums.length);i++){
        for(let j=0; j<nums.length; j++){
            if(i==a[j] && i==0){

            }
        }
    }
};
firstMissingPositive(nums)
// input nums = [1,1,2]
// ouput nums = [1,2]
// var removeDuplicates = function(nums) {
//     let newArray = []
//    for(let i = 0 ; i< nums.length; i++){
//         for(let j = 1; j<nums.length; j++){
//             if(nums[i]!=nums[j]){
//  newArray.push(nums[i])
//  return newArray
//             }
//         }
//    } return newArray
// };

// removeDuplicates(nums)
// let b = [1,5,2,6,7,]
// let word = ["hello world heddllo"];

//  const a = word.split(" ")

// console.log(a); 

// let str = ["hello world, is you are right"];

// for(let i = 0 ; i<str.length ;){
//     let words = str[i].split(" ")

//     console.log(words[i]);
// i++
    
//     }


// Output: ["hello", "world"]


// accounts = [[1,2,3],[3,2,1]]

// var maximumWealth = function(accounts) {
//     let a = 0
//     for(let i = 0; i<accounts.length; i++){
//         let b = accounts[i].length
//         for(let j = 0; j<accounts.length; j++){
//              a +=accounts[j]
//             console.log(a)
//         }
//     }
// };

// maximumWealth(accounts)

// list1 = [1,2,4], list2 = [1,3,4]

// let a = [[...list1],[...list2]]
// console.log(a)
// nums1 = [1,2,3], nums2 = [2,4,6]

// var findDifference = function(nums1, nums2) {
//     let newArray = []
//     let a = []
//     let b = []
//     for(let i=0; i<nums1.length; i++){
//         for(let j=0; j<nums2.length; j++){
//             if(nums1[i]!=nums2[j]){
                
//                 console.log(nums1[i])
//                 return nums1
//             }
//         } a.push(nums1[i]) 
        
//         console.log(a)
        
//     }
    
// };

// findDifference(nums1, nums2)
// var mergeTwoLists = function(list1, list2) {
//     let a = list1.concat(list2)
//      a = a.sort((a,b)=>a-b)
// console.log(a)
// return a
// };

// mergeTwoLists(list1, list2)

// words = ["car",121,'waw']
// function palindormic(words){
// for(let i = 0; i<words.length; i++){
//      let flag=true
//       let newWord=words[i]
//       for(let j=0;j<newWord.length;j++){
//           if(newWord[j]!==newWord[newWord.length-1-j]){
//               flag=false
//           }
//       }
//       if(flag===true){
//          return words[i]
//       }
     
// }

// }

//  let res=palindormic(words)

//  console.log(res);


