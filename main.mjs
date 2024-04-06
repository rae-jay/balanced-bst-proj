import { mergeSort } from "./mergeSorter.mjs";


console.log('bst working test');
testOne();







function randomNumber(min,max){
    // The maximum is exclusive and the minimum is inclusive
    // (assumes whole number input)
    return Math.floor(Math.random() * (max - min) + min); 
}

function createNumberArray(){
    let result = [];
    let arrayLength = randomNumber(1,17);

    for(arrayLength; arrayLength > 0; arrayLength--){
        const newNum = randomNumber(0,101);

        // don't add duplicates
        if(result.indexOf(newNum) < 0){
            result.push(newNum);
        }
        // else{
        //     console.log('duplicate ' + newNum);
        // }
    }

    result = mergeSort(result);

    return result;
}



const prettyPrint = (node, prefix = "", isLeft = true) => {
    if (node === null) {
        return;
    }
    if (node.rightChild !== null) {
        prettyPrint(node.rightChild, `${prefix}${isLeft ? "│   " : "    "}`, false);
    }
    console.log(`${prefix}${isLeft ? "└── " : "┌── "}${node.data}`);
    if (node.leftChild !== null) {
        prettyPrint(node.leftChild, `${prefix}${isLeft ? "    " : "│   "}`, true);
    }
};







class Node{
    constructor(data){
        this.data = data;
        this.leftChild = null;
        this.rightChild = null;
    }

    setRightChild(node){
        this.rightChild = node;
    }

    setLeftChild(node){
        this.leftChild = node;
    }
}

class Tree{
    constructor(array){
        this.root = Tree.buildTree(array, 0, array.length - 1);
    }

    // the way the instructions are worded make me want to think that buildTree itself
    // isn't supposed to be the recursive, but just returns the MAIN root to the constructor, BUT...
    // that feels not necessary?
    static buildTree(array, startNum, endNum){
        if(startNum > endNum){
            return null;
        }

        const mid = Math.floor((startNum + endNum)/2);
        const rootNode = new Node(array[mid]);
        
        // console.log('node value: ' + array[mid]);
        // console.log(array + ' / ' + mid);
        // console.log(rootNode);

        rootNode.setLeftChild(Tree.buildTree(array, startNum, mid-1));
        rootNode.setRightChild(Tree.buildTree(array, mid+1, endNum));

        return rootNode;
    }


    insert(value){

        // i was gonna do the 'current,previous' thing but that got complicated
        // so trying something... weirder?
        function checkInsert(current){
            if(current){
                if(value > current.data){
                    if(current.rightChild == null){
                        current.setRightChild(new Node(value));
                    }
                    else{
                        checkInsert(current.rightChild);
                    }
                }
                else if(value < current.data){
                    if(current.leftChild == null){
                        current.setLeftChild(new Node(value));
                    }
                    else{
                        checkInsert(current.leftChild);
                    }
                }
                else{
                    console.log('inserting duplicate, do nothing');
                }
            }
            else{
                console.log('i think something went wrong in checkInsert')
            }
        }
        checkInsert(this.root);



        // function checkInsert(current){
        //     if(!current){
        //         return true;
        //     }
        //     else{
        //         if(value > current.data){
        //             checkInsert(current.rightChild);
        //         }
        //         else if(value < current.data){
        //             checkInsert(current.leftChild);
        //         }
        //         else{
        //             console.log('inserting duplicate, do nothing');
        //         }
        //     }
        // }
        // checkInsert(this.root);

        /*
            starting at root, check >||<, if greater than go right, if not go left
            if ever find a duplicate just like. stop existing.
            continue until there IS no right or left where you're looking, and insert
        */
    }

    // deleteVal searches for a value and deletes it
    // deleteNode is the nested, actual deletion part of that process
    deleteVal(value){
        const tree = this;

        // checkLeft is called only if deleting a node with two children, which then needs to be replaced by the next-lowest
        // value downstream (one step to the right, then as far left as possible)
        // (it takes a 'previous' value to hand back to 'deleteNode' to pass into the RECURSIVE 'deleteNode')
        function checkLeft(current, previous){
            // console.log('CHECK WORK IN delete.checkLeft(), it\'s real sketch');
            // check left until left = null, then send that last one that WASNT back...
            // return the last thing that wasn't null

            let result = [current, previous];

            if(current.leftChild){
                result = checkLeft(current.leftChild, current);
            }

            return result;

        }

        // the actual removal, can be called recursively once, if a node has two children
        function deleteNode(node, parent){
            if(!node.rightChild && !node.leftChild){
                // no child nodes
                if(parent){
                    // maybe a cleaner way to do this bit but uh
                    if(parent.leftChild == node){
                        parent.leftChild = null;
                    }
                    else{
                        parent.rightChild = null;
                    }
                }
                else{
                    // single-node tree
                    tree.root = null;
                }
            }
            else if(!node.leftChild || !node.rightChild){
                // one child

                let child;
                if(node.leftChild) child = node.leftChild;
                else child = node.rightChild; 

                if(parent){
                    if(parent.leftChild == node){
                    parent.leftChild = child;
                    }
                    else{
                        parent.rightChild = child;
                    }
                }
                else{
                    // removing root of tree
                    tree.root = child;
                }
                
            }
            else{

                const nextLowestAndParent = checkLeft(node.rightChild, node);
                const nextLowest = nextLowestAndParent[0];
                deleteNode(...nextLowestAndParent);
            

                nextLowest.rightChild = node.rightChild;
                nextLowest.leftChild = node.leftChild;

                if(parent){
                    if(parent.leftChild == node){
                        parent.leftChild = nextLowest;
                    }
                    else{
                        parent.rightChild = nextLowest;
                    }
                }
                else{
                    tree.root = nextLowest
                }
            }
        }

        // finds the node to delete, first step in process
        function checkValue(current, previous){
            if(current){
                if(current.data == value){
                    deleteNode(current,previous);
                }
                else{
                    if(current.data > value){
                        checkValue(current.leftChild,current);
                    }
                    else{
                        checkValue(current.rightChild,current);
                    }
                }
            }
        }
        checkValue(this.root,null);
    }



    levelOrder(callback){
        // only used if callback == null
        const noCallbackResult = [];

        const queue = [this.root];

        // take first element out of queue
        // extract data, add its children to the queue
        // (loop)

        function checkQueue(){
            if(queue.length > 0){
                const node = queue.shift();

                if(callback){
                    callback(node);
                }
                else{
                    noCallbackResult.push(node.data);
                }

                if(node.leftChild) queue.push(node.leftChild);
                if(node.rightChild) queue.push(node.rightChild);

                checkQueue();
            }
        };
        checkQueue();

        if(!callback) return noCallbackResult;
    }


    preOrder(callback){
        // root / left / right

        const noCallbackResult = [];

        function checkNode(current){
            if(current){
                if(callback) callback(current);
                else noCallbackResult.push(current.data);

                checkNode(current.leftChild);
                checkNode(current.rightChild);
            }
        }
        checkNode(this.root);
        
        if(!callback) return noCallbackResult;
    }

    inOrder(callback){
        // left / root / right

        const noCallbackResult = [];

        function checkNode(current){
            if(current){
                checkNode(current.leftChild);

                if(callback) callback(current);
                else noCallbackResult.push(current.data);
                
                checkNode(current.rightChild);
            }
        }
        checkNode(this.root);
        
        if(!callback) return noCallbackResult;
    }

    postOrder(callback){
        // left / right / root

        const noCallbackResult = [];

        function checkNode(current){
            if(current){                        
                checkNode(current.leftChild);
                checkNode(current.rightChild);
                
                if(callback) callback(current);
                else noCallbackResult.push(current.data);
            }
        }
        checkNode(this.root);

        if(!callback) return noCallbackResult;
    }


    find(value){
        // this is basically levelOrder BUT that one WILL go through every single node no matter what
        // whereas this will stop 
        let result = null;
        const queue = [this.root];

        function checkQueue(){
            if(queue.length > 0){
                const node = queue.shift();

                // console.log(node.data + '/' + value)
                if(node.data == value){
                    result = node;
                    return;
                }
                else{
                    if(node.leftChild) queue.push(node.leftChild);
                    if(node.rightChild) queue.push(node.rightChild);

                    checkQueue();
                }

            }
        };
        checkQueue();

        return result;
    }


    // -height(node) function that returns the given node's height. Height is defined as the number 
    //     of edges in the longest path from a given node to a leaf node.
    height(node){
        
    }


    // -depth(node) function that returns the given node's depth. Depth is defined as the number 
    //     of edges in the path from a given node to the tree's root node.
}




// const testArray = [1,3,7,14,15,18,21,24];
// const testArray = [1, 3, 4, 5, 7, 8, 9, 23, 67, 324, 6345 ];
// const arrayTree = new Tree(testArray);
// console.log(arrayTree);
// prettyPrint(arrayTree.root);


// prettyPrint(new Tree(createNumberArray()).root);
// console.log('--------');
// prettyPrint(new Tree(createNumberArray()).root);
// console.log('--------');
// prettyPrint(new Tree(createNumberArray()).root);
// console.log('--------');
// prettyPrint(new Tree(createNumberArray()).root);
// console.log('--------');

// const testTree = new Tree([1,2,4,7,9,10,11,13,16,19,20,21]);
const testTree = new Tree([1,2,4,7,9,10]);
prettyPrint(testTree.root);
console.log('--------');

{// testTree.insert(3);
// prettyPrint(testTree.root);
// console.log('--------');
// testTree.insert(7);
// prettyPrint(testTree.root);
// console.log('--------');
// testTree.insert(11);
// prettyPrint(testTree.root);
// console.log('--------');

// testTree.deleteVal(20);
// testTree.deleteVal(16);
// testTree.deleteVal(4);
// testTree.deleteVal(10);
// prettyPrint(testTree.root);
// console.log('--------');


// console.log(testTree.levelOrder());
// testTree.levelOrder( (node) => console.log(node.data) );

// console.log(testTree.preOrder());
// testTree.preOrder( (node) => console.log(node.data) );
// console.log('--------');
// console.log(testTree.inOrder());
// testTree.inOrder( (node) => console.log(node.data) );
// console.log('--------');
// console.log(testTree.postOrder());
// testTree.postOrder( (node) => console.log(node.data) );
// console.log('--------');

// console.log(testTree.find(4));
// console.log(testTree.find(7));
// console.log(testTree.find(10));
// console.log(testTree.find(15));
// console.log(testTree.find(25));
}




/*

    
    -height(node) function that returns the given node's height. Height is defined as the number 
        of edges in the longest path from a given node to a leaf node.
    -depth(node) function that returns the given node's depth. Depth is defined as the number 
        of edges in the path from a given node to the tree's root node.
    
    -isBalanced function that checks if the tree is balanced. A balanced tree is one where the 
        difference between heights of the left subtree and the right subtree of every node is 
        not more than 1.
    -rebalance function that rebalances an unbalanced tree. Tip: You'll want to use a traversal 
        method to provide a new array to the buildTree function.
*/