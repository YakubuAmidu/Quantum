
// BUDGET CONTROLLER
var budgetController = (function(){

   var Expense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };

     Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

     Expense.prototype.getPercentage = function() {
        return this.percentage;
};


var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
};


var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
       sum += cur.value;
    });
    data.totals[type] = sum;
};

var data = {
    allItems: {
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0
    },
    budget: 0,
    percentage: -1
};

return {
    addItem: function(type, des, val) {
        var newItem, ID;

        // Create new ID
        if (data.allItems[type].length > 0) {

            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

        } else {
            ID = 0;
        }

        // Create new Item based on 'inc' or 'exp'
        if(type === 'exp'){
             newItem = new Expense(ID, des, val);
        } else if (type === 'inc'){
            newItem = new Income(ID, des, val);
        }

        // Push it into our data structure
        data.allItems[type].push(newItem);

        // Return the new element
        return newItem;
    },

    deleteItem: function(type, id) {
        var ids, index;

        // id = 6
        // data.allItems[type][id]
        // ids = [1 2 4 6 8]
        // index = 3

        ids = data.allItems[type].map(function(current) {
            return current.id;
        });

        index = ids.indexOf(id);

        if(index !== -1){
            data.allItems[type].splice(index, 1);
        }
    },

    calculateBudget: function() {

        // Calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');

        // Calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;


        // Calculate the percentage of that we spent

        if(data.totals.inc > 0){

         data.percentage = Math.round((data.totals.exp / data.totals.inc)  * 100);

        }  else {
            data.percentage = - 1;
        }
        // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.333 * 100


    },

    calculatePercentages: function() {

        /*
        a=20
        b=10
        c=40
        inconme = 100
        a=20/100=20%
        b=10/100=10%
        c=40/100=40%
        */

        data.allItems.exp.forEach(function(cur){
            cur.calcPercentage(data.totals.inc);
        });
},

    getPercentages: function() {
        var allPerc = data.allItems.exp.map(function(cur){
           return cur.getPercentage();
        });
        return allPerc;

},

    getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        };
    },


    testing: function() {
        console.log(data);
    }
};

})();


// UI CONTROLLER
var UIController = (function(){

var DomStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    ExpensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
};

var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            /*
            + or - before number
            exactly 2 decimal point
            comma separating the thousands

            2310.4567 -> +2,310.46
            2000 -> +2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
};

var nodeListForEach = function(list, callback) {
            for(var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
        };


        return {
            getInput: function() {
                return {
                type: document.querySelector(DomStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
                };
            },

            addListItem: function(obj, type) {

                var html, newHtml, element;

                // Create HTML string with placeholder text

                if(type === 'inc'){
                    element = DomStrings.incomeContainer;

                     html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></di></div></div>';

                } else if(type === 'exp'){
                    element = DomStrings.ExpensesContainer;

                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }

                // Replace the placeholder text with some actual data
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));



                // Insert the HTML into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

            },

            deleteListItem: function(selectorID) {

                var el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);

            },

            clearFields: function() {
                var fields, fieldsArr;

                fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);

                var fieldsArr = Array.prototype.slice.call(fields);

                fieldsArr.forEach(function(current, index, array) {
                    current.value = "";
                });

                fieldsArr[0].focus();

            },

            displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if(obj.percentage > 0) {
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DomStrings.percentageLabel).textContent = '---';
            }
        },


            displayPercentages: function(percentages) {

                var fields = document.querySelectorAll(DomStrings.expensesPercLabel);


                nodeListForEach(fields, function(current, index) {

                    if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '---';
                    }
                });

            },

            displayMonth: function() {
                var now, months, month, year;

                now = new Date();
                //var Christmas = new Date(2016, 11, 25);
                months = ['January', 'Februay', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December']
                month = now.getMonth();

                year = now.getFullYear();
                document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;

            },

            changedType: function() {

                var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDescription + ',' +
                DomStrings.inputValue);


                nodeListForEach(fields, function(cur) {
                    cur.classList.toggle('red-focus');
                });


                document.querySelector(DomStrings.inputBtn).classList.toggle('red');

        },

            getDomStrings: function() {
                return DomStrings;
            }
        };

    })();


    // GLOBAL CONTROLLER
    var controller = (function(budgetCtrl, UICtrl){

        var setUpEvenListeners = function() {
            var Dom = UICtrl.getDomStrings();

            document.querySelector(Dom.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
          });

          document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);

          document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changeType);

      };

      var updateBudget = function() {

           // 1. Calculate the budget
          budgetCtrl.calculateBudget();

           // Return the budget
          var budget = budgetCtrl.getBudget();


           // 2. Display the budget on the UI
          UICtrl.displayBudget(budget);
      };


      var updatePercentages = function() {

          // 1. Calculate percentages
          budgetCtrl.calculatePercentages();
          // 2. Read percentages from the budget controler
          var percentages = budgetCtrl.getPercentages();
          // 3. Update the UI with the new percentages
          UICtrl.displayPercentages(percentages);
      };

      var ctrlAddItem = function() {
          var input, newItem;

          // 1. Get the field input data
          input = UICtrl.getInput();

          if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

               // 2. Add the item to the budget controller
          newItem = budgetCtrl.addItem(input.type, input.description, input.value);


      // 3. Add the item to the UI
          UICtrl.addListItem(newItem, input.type);


      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
          updateBudget();

      // 6. Calculate and update percentages
              updatePercentages();

          }
      };

      var ctrlDeleteItem = function(event) {
          var itemID, splitID, type, ID;

          itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

          if(itemID) {

              // inc-1
              splitID = itemID.split('-');
              type = splitID[0];
              ID = parseInt(splitID[1]);

              // 1. Delete the Item from the data structure
              budgetCtrl.deleteItem(type, ID);


              // 2. Delete the Item from UI

              UICtrl.deleteListItem(itemID);

              // 3. Update and show the new budget

              updateBudget();

              // 4. Calculate and update percentages
              updatePercentages();
          }

      };

      return {init: function() {
          console.log('Application has started.');
          UICtrl.displayMonth();
           UICtrl.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
           });
          setUpEvenListeners();
      }
  };

  })(budgetController, UIController);

  controller.init();
