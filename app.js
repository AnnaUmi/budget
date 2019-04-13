const budgetController = (function() {
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  const Incomes = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(i => (sum += i.value));
    data.totals[type] = sum;
  };
  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    precentage: -1
  };
  return {
    addItems: function(type, des, val) {
      let newItem, ID;
      // ID = last ID + 1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Incomes(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      const ids = data.allItems[type].map(current => current.id);
      const index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      // 1 calculate total = inc + exp
      calculateTotal("exp");
      calculateTotal("inc");
      // 2 посчитать budget = inc - exp
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        precentage: data.precentage
      };
    },
    test: function() {
      console.log(data);
    }
  };
})();

const UIcontroller = (function() {
  const DOMstring = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomesContainer: ".incomes__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    precentageLabel: ".budget__expenses--percentage",
    container: ".container"
  };
  return {
    getInput() {
      return {
        type: document.querySelector(DOMstring.inputType).value,
        description: document.querySelector(DOMstring.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstring.inputValue).value)
      };
    },
    addListItem(obj, type) {
      let html, elemnent;
      if (type === "inc") {
        elemnent = DOMstring.incomesContainer;
        html = `<div class="item" id="inc-${obj.id}"><div class="item__decr">${
          obj.description
        }</div><div class="item__value">${obj.value}</div><button 
        class="item__del">x</button>
        </div>`;
      } else if (type === "exp") {
        elemnent = DOMstring.expensesContainer;
        html = `<div class="item" id="exp-${obj.id}"><div class="item__decr">${
          obj.description
        }</div><div class="item__value">${obj.value}</div><button 
        class="item__del">x</button></div>`;
      }
      document.querySelector(elemnent).insertAdjacentHTML("beforeend", html);
    },
    deleteListItem: function(itemId) {
      const element = document.getElementById(itemId);
      element.parentNode.removeChild(element);
    },
    clearFields: function() {
      const fields = document.querySelectorAll(
        DOMstring.inputDescription + "," + DOMstring.inputValue
      );
      fields.forEach(item => (item.value = ""));
      fields[0].focus();
    },
    displayBudget: function(obj) {
      document.querySelector(DOMstring.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstring.incomeLabel).textContent =
        "+ " + obj.totalInc;
      document.querySelector(DOMstring.expensesLabel).textContent =
        "- " + obj.totalExp;
      if (obj.precentage > 0) {
        document.querySelector(DOMstring.precentageLabel).textContent =
          obj.precentage + "%";
      } else {
        document.querySelector(DOMstring.precentageLabel).textContent = "---";
      }
    },
    getDOMstrings() {
      return DOMstring;
    }
  };
})();

const controller = (function(budgetCtr, UIctr) {
  const setupEventListener = function() {
    const DOM = UIctr.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrDeleteItem);
  };

  const updateBudget = function() {
    // 1 calculate budget
    budgetCtr.calculateBudget();
    // 2 Возвращать
    const budget = budgetCtr.getBudget();
    // отображать в UI
    UIctr.displayBudget(budget);
  };

  const ctrlAddItem = function() {
    const input = UIctr.getInput();
    // 1.При нажатии на кнопку надо получить данные с input
    // 2.Добавить эти данные добавить в budgetController

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      const newItem = budgetCtr.addItems(
        input.type,
        input.description,
        input.value
      );
      UIctr.addListItem(newItem, input.type);
      // очисть поля
      UIctr.clearFields();
      // 4.Посчитать бюджет
      updateBudget();
      // 5.Отобразить бюджет в UI
    }
  };
  const ctrDeleteItem = function(event) {
    // 1 получить id
    const itemId = event.target.parentNode.id;
    if (itemId) {
      let splitId = itemId.split("-");
      console.log(splitId);
      let type = splitId[0];
      let Id = parseInt(splitId[1]);
      console.log(Id);
      //2 удалить итем со структуры данных
      budgetCtr.deleteItem(type, Id);
      // 3 удалить с UI
      UIctr.deleteListItem(itemId);
      updateBudget();
    }
  };
  return {
    init() {
      setupEventListener();
      UIctr.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        precentage: -1
      });
    }
  };
})(budgetController, UIcontroller);

controller.init();
