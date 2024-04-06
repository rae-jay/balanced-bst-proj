

export function mergeSort(arr){
    if(arr.length == 1){
        return arr;
    }

    const split = splits(arr);
    let leftHalf = split[0];
    let rightHalf = split[1];

    leftHalf = mergeSort(leftHalf);
    rightHalf = mergeSort(rightHalf);

    let result = merge(leftHalf, rightHalf);
    return result;
}


function splits(arr){

    let half = Math.ceil(arr.length/2);

    let leftHalf = [];
    let rightHalf = arr;

    for(half; half > 0; half--){
        leftHalf.push(rightHalf.shift());
    }

    let result = [leftHalf,rightHalf];

    return result;
}


function merge(leftHalf, rightHalf){
    let result = [];

    while(leftHalf.length > 0 || rightHalf.length > 0){
        if(rightHalf.length == 0){ 
            result.push(leftHalf.shift()); 
        }
        else if(leftHalf.length == 0){
            result.push(rightHalf.shift());
        }
        else if(leftHalf[0] < rightHalf[0]){
            result.push(leftHalf.shift());
        }
        else{
            result.push(rightHalf.shift());
        }
    }

    return result;
}