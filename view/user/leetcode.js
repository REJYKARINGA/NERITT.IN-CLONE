nums = [0,1,0,3,0,12]

var maxProduct = function(nums) {
     nums.sort((a,b)=>b-a)
     nums =(nums[0]-1)*(nums[1]-1)
    
};

maxProduct(nums)