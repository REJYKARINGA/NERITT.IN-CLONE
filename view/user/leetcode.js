nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];

 function removeDuplicates(num) {
    let i = 0;
    for (let j = 1; j < num.length; j++) {
        if (num[i] !== num[i-1]) {
            i++;
            num[i] = num[j];
        }
    }
    return num
}

removeDuplicates(nums);
console.log("hello leetcode")