nums = [0,1,0,3,0,12]

var removeDuplicates = function(nums) {
    for(let i = 0; i<nums.length; i++){
        for(let j = i + 1; j<nums.length; j++){
            if(nums[i]!==nums[j]){
                numss = nums.push(nums[i])
                console.log()
        }
        }
    }
};

removeDuplicates(nums)