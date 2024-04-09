import { mergeSort } from "./mergeSorter.mjs";


console.log('bst working test');



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
        let heightCount = 0;

        function checkChildren(nodes){
            const children = [];
            let leafFound = false;
            

            for(const nodeC of nodes){
                if(leafFound == true){
                    console.log('Tree.height has an issue');
                }

                if(nodeC.leftChild == null){
                    if(nodeC.rightChild == null){
                        leafFound = true;
                        break;
                    }
                    else{
                        children.push(nodeC.rightChild)
                    }
                }
                else{
                    children.push(nodeC.leftChild);
                }
            }

            if(leafFound == false){
                heightCount += 1;
                checkChildren(children);
            }
        }
        checkChildren([node]);


        return heightCount;
    }


    // -depth(node) function that returns the given node's depth. Depth is defined as the number 
    //     of edges in the path from a given node to the tree's root node.

    depth(node){
        let depthCount = 0;
        let nodeFound = false;

        function checkNodes(nodes){
            const children = [];

            for(const nodeC of nodes){
                if(nodeC == node){
                    nodeFound = true;
                    break;
                }
                else{
                    if(nodeC.leftChild) children.push(nodeC.leftChild);
                    if(nodeC.rightChild) children.push(nodeC.rightChild);
                }
            }

            if(nodeFound == false && children.length > 0){
                depthCount += 1;
                checkNodes(children);
            }
        }
        checkNodes([this.root]);

        if(nodeFound == true){
            return depthCount;
        }
        else{
            return -1;
        }
    }


    isBalanced(){

        function checkBalance(current){
            // if parent node's child is null
            if(!current) return [-1, true];
            
            const [leftHeight, leftBal] = checkBalance(current.leftChild);
            const [rightHeight, rightBal] = checkBalance(current.rightChild);

            if(leftBal == true && rightBal == true){
                const dif = leftHeight - rightHeight;
                if(dif >= -1 && dif <= 1){
                    // subtrees of 'current' are themselves balanced
                    // and differ in height by 1 or less
                    let currentHeight;
                    if(rightHeight > leftHeight) currentHeight = rightHeight;
                    else currentHeight = leftHeight;
                    // current height is height of the tallest direct child +1
                    currentHeight += 1;

                    return [currentHeight, true];
                }

                // this node's left/right are not balanced, so fail
                return [undefined, false];
            }
            // subtrees are already unbalanced, so fail
            return [undefined, false];

        }
        const result = checkBalance(this.root);

        return result[1];
    }

    
    rebalance(){
        const array = this.inOrder();
        this.root = Tree.buildTree(array, 0, array.length - 1);
    }
    // -rebalance function that rebalances an unbalanced tree. Tip: You'll want to use a traversal 
    //     method to provide a new array to the buildTree function.
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
// const testTree = new Tree([1,2,4,7,9,10]);
// prettyPrint(testTree.root);
// console.log('--------');

// testTree.insert(14);
// testTree.insert(15);
// testTree.insert(16);
// testTree.insert(17);
// testTree.insert(18);
// testTree.insert(19);
// testTree.insert(21);
// prettyPrint(testTree.root);
// console.log('--------');

// console.log(testTree.isBalanced());
// // console.log(testTree.inOrder());
// testTree.rebalance();
// prettyPrint(testTree.root);
// console.log('--------');
// console.log(testTree.isBalanced());




// console.log(testTree.height(testTree.find(9)));
// console.log(testTree.height(testTree.find(1)));


// console.log('10 height is: ' + testTree.height(testTree.find(10)));
// console.log('4 height is: ' + testTree.height(testTree.find(4))); 
// console.log('20 height is: ' + testTree.height(testTree.find(20)));
// console.log('9 height is: ' + testTree.height(testTree.find(9)));

// console.log('10 depth is: ' + testTree.depth(testTree.find(10)));
// console.log('4 depth is: ' + testTree.depth(testTree.find(4))); 
// console.log('20 depth is: ' + testTree.depth(testTree.find(20)));
// console.log('9 depth is: ' + testTree.depth(testTree.find(9)));


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


