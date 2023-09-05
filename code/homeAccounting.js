"use strict"

document.addEventListener("DOMContentLoaded", () => {
  const firstNameElement = document.getElementById("firstName");
  const lastNameElement = document.getElementById("lastName");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  if (firstName && lastName) {
    firstNameElement.textContent = firstName;
    lastNameElement.textContent = lastName;
  }
});

const nameRegex = /^[a-zA-Z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRegex = /^(?=.*\d)[a-zA-Z\d]{8,}$/;

const validateField = (value, regex) => {
  return regex.test(value);
};

const modalData = [
  { title: "Change name", buttonText: "Save name", identifier: "name" },
  { title: "Change surname", buttonText: "Save surname", identifier: "secondname" },
  { title: "Change email", buttonText: "Save email", identifier: "mail" },
  { title: "Change password", buttonText: "Save password", identifier: "password", passwordFields: true, },
];

modalData.forEach((data) => {
  const errorId = `error__${data.identifier}`;
  const nameForm = `form__${data.identifier}`;
  const nameModal = `${data.identifier}__modal`;

  const modalContent = `
  <div id="${nameModal}" class="modal">
    <div class="modal__content">
      <span class="close">&times;</span>
      <form id="${nameForm}" novalidate>
        <h2 class="modal__title">${data.title}</h2>
        <span class="not-exist__error"></span>
      ${
        data.passwordFields
          ? `
        <input type="text" name="name" style="display: none;" aria-hidden="true" autocomplete="username">
        <input type="password" name="${data.identifier}" placeholder="Enter password" class="input" autocomplete="new-password" required>
        <input type="password" name="${data.identifier}__confirm" placeholder="Confirm password" class="input" autocomplete="new-password" required>
      `
          : `
        <input type="text" name="${data.identifier}" placeholder="${data.title}" class="input" autocomplete="off" required>
      `
      }
        <span class="error__text" id="${errorId}"></span>
        <span class="error__message"></span>
        <span class="info">You have successfully changed your data!</span><br>
        <button type="submit" class="submit__btn">${data.buttonText}</button>
      </form>
    </div>
  </div>
  `;

  const containerModal = document.getElementById('container__modal');
  containerModal.insertAdjacentHTML('afterbegin', modalContent);
});

const clearInputs = () => {
  const inputFields = document.querySelectorAll('.modal__content input');
  inputFields.forEach(input => {
    input.value = '';
  });
  const errorTextElements = document.querySelectorAll('.error__text');
  errorTextElements.forEach(errorText => {
    errorText.textContent = '';
  });
};

const errorMessage = document.querySelectorAll('.error__message');
const notExistError = document.querySelectorAll('.not-exist__error');
const infoSucces = document.querySelectorAll('.info');

const showElement = (elements) => {
  elements.forEach(element => {
    if (element) {
      element.style.display = "block";
    }
  });
};

const hideElement = (elements) => {
  elements.forEach(element => {
    if (element) {
      element.style.display = "none";
    }
  });
};

const setMessage = (elements, message) => {
  elements.forEach(element => {
    element.textContent = message;
  });
};

const checkEmailExists = (email, callback) => {
  fetch('https://reqres.in/api/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })
  .then(res => {
    if (!res.ok) {
      throw new Error('Server error');
    }
    return res.json();
  })
  .then(data => {
    callback(null, data.exists); // server will return an object { exists: true } or { exists: false }
  })
  .catch(error => {
    console.log('Error checking email:', error);
    callback(error, false);
  });
};

const validateAndSubmitForm = (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);

  const formIdentifier = form.getAttribute('id');
  let emailInput;

  switch (formIdentifier) {
    case "form__name":
      const nameInput = formData.get('name');
      if (!validateField(nameInput, nameRegex)) {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "Incorrect name format");
        return;
      } else {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "");
      }
      break;

    case "form__secondname":
      const surnameInput = formData.get('secondname');
      if (!validateField(surnameInput, nameRegex)) {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "Incorrect surname format");
        return;
      } else {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "");
      }
      break;

    case "form__mail":
      emailInput = formData.get('mail');
      if (!validateField(emailInput, emailRegex)) {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "Incorrect email format");
        return;
      } else {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "");
      }
      break;

    case "form__password":
      const passInput = formData.get('password');
      const confirmPassInput = formData.get('password__confirm');

      if (!validateField(passInput, passRegex)) {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "The password must contain a minimum of 8 characters, including at least one digit");
        return;
      } else {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "");
      }

      if (passInput !== confirmPassInput) {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "Passwords do not match");
        return;
      }
      break;

    default:
      return;
    }

  checkEmailExists(emailInput, (error, emailExists) => {
    if (error) {
      console.log('Error during email check:', error);
      setMessage(notExistError, data);
    } else {
      if (emailExists) {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), 'This email already exists in the database');
        return;
      } else {
        setMessage(document.querySelectorAll(`#${formIdentifier} .error__text`), "");
      }

      fetch('https://reqres.in/api/four-modals', {
        method: 'POST',
        body: data
      }).then(res => {
        if (!res.ok) {
          throw new Error("Server error");
        }
        return res.json()
        }).then(data => {
        if (data) {
          const modals = document.getElementsByClassName('modal');
          showElement(infoSucces);
          setTimeout(() => {
            hideElement(infoSucces);
            for (let j = 0; j < modals.length; j++) {
              modals[j].style.display = 'none';
            }
            clearInputs();
          }, 2000);
        } else {
          setMessage(notExistError, data);
        }
        console.log(data);
      }).catch(error => {
        setMessage(errorMessage, "No server connection");
        console.log(error);
      });
    }
  });
};

const nameForm = document.getElementById('form__name');
nameForm.addEventListener("submit", validateAndSubmitForm);
const secondnameForm = document.getElementById('form__secondname');
secondnameForm.addEventListener("submit", validateAndSubmitForm);
const mailForm = document.getElementById('form__mail');
mailForm.addEventListener("submit", validateAndSubmitForm);
const passwordForm = document.getElementById('form__password');
passwordForm.addEventListener("submit", validateAndSubmitForm);

const html = document.querySelector('html');
const logoutModal = document.getElementById('logout__modal');
const changeModalAll = document.getElementById('change__modal-all');
const nameModal = document.getElementById('name__modal');
const surnameModal = document.getElementById('secondname__modal');
const emailModal = document.getElementById('mail__modal');
const passwordModal = document.getElementById('password__modal');

const openModal = (modal) => {
  modal.style.display = 'block';
  html.classList.add('modal__open');
}
const closeModal = (modal) => {
  modal.style.display = 'none';
  html.classList.remove('modal__open');
}
const openModalHandler = (modal, button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(modal);
  });
}
const logoutButton = document.getElementById('open__logout');
const changeButton = document.getElementById('open__change-profile');
const nameButton = document.getElementById('name__btn');
const surnameButton = document.getElementById('surname__btn');
const emailButton = document.getElementById('email__btn');
const passwordButton = document.getElementById('pass__btn');
openModalHandler(logoutModal, logoutButton);
openModalHandler(changeModalAll, changeButton);
openModalHandler(nameModal, nameButton);
openModalHandler(surnameModal, surnameButton);
openModalHandler(emailModal, emailButton);
openModalHandler(passwordModal, passwordButton);

const closeButtons = document.getElementsByClassName('close');
for (let i = 0; i < closeButtons.length; i++) {
  closeButtons[i].addEventListener("click", () => {
    const modals = document.getElementsByClassName('modal');
    for (let j = 0; j < modals.length; j++) {
      modals[j].style.display = 'none';
    }
    clearInputs();
  });
}

const yesBtn = document.querySelector('.yes__btn');
const noBtn = document.querySelector('.no__btn');

const submitLogoutForm = (e) => {
  e.preventDefault();

  const formData = new FormData(logoutForm);
  const data = new URLSearchParams(formData);

  fetch('https://reqres.in/api/logout', {
    method: 'POST',
    body: data
  }).then(res => {
    if (!res.ok) {
      throw new Error("Server error");
    }
    return res.json()
  }).then(data => {
    if (data) {
      setTimeout(() => {
        logoutModal.style.display = "none";
        document.location.href = '../public/index.html';
      }, 2000);
    } else {
      setMessage(notExistError, data);
    }
    console.log(data);
  }).catch(error => {
    setMessage(errorMessage, "No server connection");
    console.log(error);
  });
};
const logoutForm = document.getElementById('form__logout');
logoutForm.addEventListener("submit", submitLogoutForm);

yesBtn.addEventListener("click", (e) => {
  e.preventDefault();
  submitLogoutForm(e);
});

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logoutModal.style.display = 'none';
});

const usernameBtn = document.getElementById('username');
const transactionBtn = document.getElementById('transaction');
const filterBtn = document.getElementById('filter');
const userBlock = document.getElementById('user__block');
const transactionBlock = document.getElementById('transaction__block');
const filterBlock = document.getElementById('filter__block');
const transactionArrow = document.querySelector('.arrow');
const filterArrow = filterBtn.querySelector('.arrow');
let currentOpenBlock = null;

const toggleBlock = (block, arrow, flag) => {
  if (flag) {
    block.style.display = 'block';
    if (arrow !== null) {
      arrow.classList.add('active');
    }
  } else {
    block.style.display = 'none';
    if (arrow !== null) {
      arrow.classList.remove('active');
    }
  }
};

const closeOtherBlocks = (blockToKeepOpen) => {
  if (transactionBlock !== blockToKeepOpen) {
    toggleBlock(transactionBlock, transactionArrow, false);
  }
  if (filterBlock !== blockToKeepOpen) {
    toggleBlock(filterBlock, filterArrow, false);
  }
  if (userBlock !== blockToKeepOpen) {
    toggleBlock(userBlock, null, false);
  }
};

const handleBtnClick = (btn, block, arrow) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentOpenBlock === block) {
      toggleBlock(block, arrow, false);
      currentOpenBlock = null;
    } else {
      toggleBlock(block, arrow, true);
      closeOtherBlocks(block);
      currentOpenBlock = block;
    }
  });
};
handleBtnClick(usernameBtn, userBlock, null);
handleBtnClick(transactionBtn, transactionBlock, transactionArrow);
handleBtnClick(filterBtn, filterBlock, filterArrow);

document.addEventListener("click", (e) => {
  if (!transactionBtn.contains(e.target) && !transactionBlock.contains(e.target) &&
    !filterBtn.contains(e.target) && !filterBlock.contains(e.target) &&
    !usernameBtn.contains(e.target) && !userBlock.contains(e.target)) {
    closeOtherBlocks(null);
    currentOpenBlock = null;
  }
});

const menuTrans = document.querySelector('.menu__trans');
menuTrans.addEventListener("click", (e) => {
  e.stopPropagation();
});

const menuFilt = document.querySelector('.menu__filter');
menuFilt.addEventListener("click", (e) => {
  e.stopPropagation();
});

const submitChangeForm = (e) => {
  const usernameInput = document.querySelector('input[name="username"]');
  const usernameError = document.getElementById('username__error');
  const surnameInput = document.querySelector('input[name="surname"]');
  const surnameError = document.getElementById('surname__error');
  const emailInput = document.querySelector('input[name="email"]');
  const emailError = document.getElementById('email__error');
  const confirmEmailInput = document.querySelector('input[name="confirm-mail"]');
  const confirmEmailError = document.getElementById('confirm__email-error');
  const passInput = document.querySelector('input[name="pass"]');
  const passError = document.getElementById('change__pass-error');
  const confirmPassInput = document.querySelector('input[name="confirm-pass"]');
  const confirmPassError = document.getElementById('confirm__pass-error');
  e.preventDefault();

  if (!validateField(usernameInput.value, nameRegex)) {
    usernameError.textContent = "Incorrect username format";
    return;
  } else {
    usernameError.textContent = "";
  }

  if (!validateField(surnameInput.value, nameRegex)) {
    surnameError.textContent = "Incorrect surname format";
    return;
  } else {
    surnameError.textContent = "";
  }

  if (!validateField(emailInput.value, emailRegex)) {
    emailError.textContent = "Incorrect email format";
    return;
  } else {
    emailError.textContent = "";
  }

  if (emailInput.value !== confirmEmailInput.value) {
    confirmEmailError.textContent = 'Email addresses do not match';
    return
  } else {
    confirmEmailError.textContent = "";
  }

  if (!validateField(passInput.value, passRegex)) {
    passError.textContent = "The password must contain a minimum of 8 characters, including at least one digit";
    return;
  } else {
    passError.textContent = "";
  }

  if (passInput.value !== confirmPassInput.value) {
    confirmPassError.textContent = "Passwords do not match";
    return
  } else {
    confirmPassError.textContent = "";
  }

  checkEmailExists(emailInput.value, (error, emailExists) => {
    if (error) {
      console.log('Error during email check:', error);
      setMessage(notExistError, data);
    } else {
      if (emailExists) {
        emailError.textContent = 'This email already exists in the database';
        return;
      } else {
        emailError.textContent = '';
      }

    const formData = new FormData(changeForm);
    const data = new URLSearchParams(formData);
    
    fetch('https://reqres.in/api/profile', {
      method: 'POST',
      body: data
    }).then(res => {
      if (!res.ok) {
        throw new Error("Server error");
      }
      return res.json()
    }).then(data => {
      if (data) {
        showElement(infoSucces);
        setTimeout(() => {
          changeModalAll.style.display = "none";
          hideElement(infoSucces);
          clearInputs();
        }, 2000);
      } else {
        setMessage(notExistError, data);
      }
      console.log(data);
    }).catch(error => {
      setMessage(errorMessage, "No server connection");
      console.log(error);
    });
    }
  });
};
const changeForm = document.getElementById('form__profile');
changeForm.addEventListener("submit", submitChangeForm);

const categoryExpenses = document.getElementById('category__expenses');
const categoryIncome = document.getElementById('category__income');
const categoryExpensesFilter = document.getElementById('category__expenses-filter');
const categoryIncomeFilter = document.getElementById('category__income-filter');

const typeSelect = document.getElementById('type');
typeSelect.addEventListener("change", function () {
  if (this.value === 'Expenses') {
    categoryExpenses.style.display = 'block';
    categoryIncome.style.display = 'none';
  } else if (this.value === 'Income') {
    categoryExpenses.style.display = 'none';
    categoryIncome.style.display = 'block';
  } else {
    categoryExpenses.style.display = 'none';
    categoryIncome.style.display = 'none';
  }
});

const typeSelectFilter = document.getElementById('type__filter');
const categoryLabel = document.getElementById('category__label');

typeSelectFilter.addEventListener("change", function () {
  if (this.value === 'All') {
    categoryLabel.classList.add('hidden');
    categoryExpensesFilter.style.display = 'none';
    categoryIncomeFilter.style.display = 'none';
  } else {
    categoryLabel.classList.remove('hidden');
    categoryExpensesFilter.style.display = this.value === 'Expenses' ? 'block' : 'none';
    categoryIncomeFilter.style.display = this.value === 'Income' ? 'block' : 'none';
  }
});

const displayTransactions = (transactions) => {
  const tableBody = document.getElementById('table__body');
  tableBody.innerHTML = '';
  transactions.forEach((transaction) => {
    const newRow = tableBody.insertRow();
    const typeCell = newRow.insertCell();
    typeCell.textContent = transaction.type;
    const amountCell = newRow.insertCell();
    amountCell.textContent = transaction.amount;
    const descriptionCell = newRow.insertCell();
    descriptionCell.textContent = transaction.description;
    const categoryCell = newRow.insertCell();
    categoryCell.textContent = transaction.category;
    const dateCell = newRow.insertCell();
    dateCell.textContent = transaction.date;
    const deleteCell = newRow.insertCell();
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('btn__delete');
    deleteBtn.addEventListener('click', () => {
      tableBody.deleteRow(newRow.rowIndex);
      displayTotalBalance();
    });
    deleteCell.append(deleteBtn);
  });
};

const getTransactions = () => {
  fetch('https://reqres.in/api/transactions', {
    method: 'GET',
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("Server error");
    }
    return res.json();
  })
  .then(data => {
    if (data && data.transactions && Array.isArray(data.transactions)) {
      displayTransactions(data.transaction);
    } else {
      const emptyTable = document.querySelector('.empty');
      setMessage(emptyTable);
    }
  })
  .catch(error => {
    setMessage(errorMessage, "No server connection");
    console.log(error);
  });
};

const handleTransactionApply = (e) => {
  e.preventDefault();
  const typeSelect = document.getElementById('type');
  const amountInput = document.getElementById('amount');
  const descriptionInput = document.getElementById('description');
  const categoryExpenses = document.getElementById('category__expenses');
  const categoryIncome = document.getElementById('category__income');
  const dateInput = document.getElementById('date');
  
  const transactionData = {
    type: typeSelect.value,
    amount: amountInput.value,
    description: descriptionInput.value,
    category: typeSelect.value === 'Expenses' ? categoryExpenses.value : categoryIncome.value,
    date: dateInput.value,
  };
  
  fetch('https://reqres.in/api/home', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transactionData)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("Server error");
    }
    return res.json();
  })
  .then(data => {
    if (data) {
      console.log(data);
      const createTable = document.getElementById('table__body');
      const newRow = createTable.insertRow(0);
      const typeCell = newRow.insertCell();
      typeCell.textContent = transactionData.type;
      const amountCell = newRow.insertCell();
      amountCell.textContent = transactionData.amount;
      const descriptionCell = newRow.insertCell();
      descriptionCell.textContent = transactionData.description;
      const categoryCell = newRow.insertCell();
      categoryCell.textContent = transactionData.category;
      const dateCell = newRow.insertCell();
      dateCell.textContent = transactionData.date;
      const deleteCell = newRow.insertCell();
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.add('btn__delete');
      deleteBtn.addEventListener("click", () => {
        createTable.deleteRow(newRow.rowIndex);
        displayTotalBalance();
      });
      deleteCell.append(deleteBtn);

      amountInput.value = '';
      descriptionInput.value = '';
      categoryExpenses.value = 'Foodstuff';
      categoryIncome.value = 'Salary';
      dateInput.value = '';

      transactionBlock.style.display = 'none';
      filterBlock.style.display = 'none';
      transactionArrow.classList.remove('active');
      filterArrow.classList.remove('active');
      displayTotalBalance();

      getTransactions();
    } else {
      setMessage(notExistError, data);
    }
  })
  .catch(error => {
    setMessage(errorMessage, "No server connection");
    console.log(error);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  getTransactions();
  const transactionApply = document.querySelector('.transaction__apply');
  transactionApply.addEventListener("click", handleTransactionApply);
});

const filterApply = document.querySelector('.filter__apply');
filterApply.addEventListener("click", (e) => {
  e.preventDefault();
  const typeFilter = document.getElementById('type__filter').value;
  const dateStartFilter = document.getElementById('date__start').value;
  const dateEndFilter = document.getElementById('date__end').value;
  const categoryExpensesFilter = document.getElementById('category__expenses-filter').value;
  const categoryIncomeFilter = document.getElementById('category__income-filter').value;
  const rows = document.querySelectorAll('#table__body tr');
  rows.forEach(row => {
    row.style.display = '';
  });
  rows.forEach(row => {
    const typeCell = row.querySelector('td:nth-child(1)');
    const dateCell = row.querySelector('td:nth-child(5)');
    const categoryCell = row.querySelector('td:nth-child(4)');
    const type = typeCell.textContent;
    const date = dateCell.textContent;
    const category = categoryCell.textContent;
    const showRow = (
      (typeFilter === 'All' || type === typeFilter) &&
      (dateStartFilter === '' || date >= dateStartFilter) &&
      (dateEndFilter === '' || date <= dateEndFilter) &&
      (categoryExpensesFilter === 'All Expenses' || category === categoryExpensesFilter) &&
      (categoryIncomeFilter === 'All Income' || category === categoryIncomeFilter)
    );
    row.style.display = showRow ? '' : 'none';
  });
  filterBlock.style.display = 'none';
  filterArrow.classList.remove('active');
});


// BODY -------------------------------------------------------------------------------------------

const bodyContainer = document.getElementById('body__container');

const createH1 = document.createElement('h1');
createH1.textContent = 'Home Accounting';
bodyContainer.prepend(createH1);

const createP2 = document.createElement('p');
createP2.classList.add('text__body');
createP2.textContent = 'Here you can enter your transactions and view a list of all saved transactions.';
createH1.after(createP2);

const balanceContainer = document.createElement('div');
balanceContainer.classList.add('balance__container');
balanceContainer.textContent = 'Total Balance:';
createP2.after(balanceContainer);
const balanceScreen = document.createElement('input');
balanceScreen.classList.add('screen__balance');
balanceScreen.type = 'text';
balanceScreen.setAttribute('disabled', 'true');
balanceScreen.id = 'total__balance';
balanceContainer.append(balanceScreen);

const calcTotalBalance = () => {
  const rows = document.querySelectorAll('#table__body tr');
  let totalBalance = 0;

  rows.forEach(row => {
    const amountCell = row.querySelector('td:nth-child(2)');
    const amount = parseFloat(amountCell.textContent);

    if (!isNaN(amount)) {
      totalBalance += amount;
    }
  });

  return totalBalance;
};

const displayTotalBalance = () => {
  const totalBalanceEl = document.getElementById('total__balance');
  const totalBalance = calcTotalBalance();

  totalBalanceEl.value = `$${totalBalance.toFixed(2)}`;
};
displayTotalBalance();

const tableEmpty = document.createElement('span');
tableEmpty.classList.add('empty');
tableEmpty.textContent = 'Table is empty';
balanceContainer.after(tableEmpty);

const tableContainer = document.createElement('div');
tableContainer.classList.add('table__container');
bodyContainer.append(tableContainer);

const createTable = document.createElement('table');
createTable.classList.add('table__body');
createTable.id = 'table__body';
tableContainer.append(createTable);

const footer = document.createElement('footer');
footer.textContent = 'by 2023';
document.body.append(footer);