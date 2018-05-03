//set variables to require packages 
let mysql = require("mysql");
let inquirer = require("inquirer");
require("console.table");

// create the connection information for the sql database
let connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw (err);
  console.log('You are connected with ThreadId # ' + connection.threadId);
  loadProducts();
});
//load products as soon as connection has been established
function loadProducts(){
    //set query to grab everything from products table in database for display
    let query = 'SELECT * FROM products';
    connection.query(query, function(err, res){
        console.table(res);
    promptCustomerForItem(res);
    });
}
//first prompt asks customer which item they would like to purchase
function promptCustomerForItem(inventory){
    inquirer.prompt(
        {
        name: 'choice',
        type: 'input',
        message: 'What is the ID of the product you would like to buy?'
       
        }).then(function(val) {
        //set parsed user choice into variable choiceID
        let choiceID = parseInt(val.choice);
        //query products to see if have enough
        //use choiceID and inventory to pass through checkInventory function to determine if item is available for purhcase
        let products = checkInventory(choiceID, inventory);
            if(products){
        //if choiceID is part of the inventory, prompt with quantity function 
                promptCustomerForQuantity(products);
            }else{
        //if choiceID is not part of inventory, console the message and reload products
                console.log('That item is not in our inventory');
                loadProducts();
            }
        });
}
//checkInventory function takes in user derived choiceID and inventory run it through the for loop to determine if that item is part of the products database
function checkInventory(choiceID, inventory){
        for (var i=0; i<inventory.length; i++){
            //console.log(inventory[i].item_id);
            //if item.id matches the user derived choiceID then console message
            if (inventory[i].item_id === choiceID){
                console.log("That item is in stock!");
                return inventory[i];
            }
        }
        return null;
}
//second prompt that asks user for quantity that they would like to purhcase
function promptCustomerForQuantity(products){
        inquirer.prompt(
            {
            name:'quantity',
            type: 'input',
            message: 'how many units of the product would you like to buy?'
            //prompt for quantity

        }).then(function(val){
// set parseInt val to variable 
            let quantity =  parseInt(val.quantity);
//if quantity entered by user is greater than quantity available then console message and loadproducts again
            if (quantity > products.stock_quantity){
                console.log('Not enough in our inventory, please select a lesser quantity or a different item.');
                loadProducts();
//else console message and continue with making the purhcase
            }else{
                console.log('Quantity available, proceeding to make the purchase!');
                makePurchase(products, quantity);
                
            }
        });
}
//function to make purhcase
function makePurchase(product, quantity) {
    var price = product.price;
//updating and displaying the database stock_quantities after purchase 
    connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?',
        [quantity, product.item_id],
        function(err, res) {
            //console total amount for purchase 
            console.log('Your total cost for this purchase is: $'+quantity * price);
           //console that quantities have been updated 
            console.log('Quantites have been updated!');

            loadProducts();
        }

    )
}