nums =[5,0,1,2,3,4,4,3]


var findDuplicates = function(nums) {
    let i = 0 ;
    for(i ; i<nums.length; i++){
        for(let j = i+1; j<nums.length; j++){
            if(nums[i]==nums[j]){
                nums[i] = nums[i]
                return nums
            }
        }
    }return nums
};

findDuplicates(nums)
console.log(findDuplicates(nums))