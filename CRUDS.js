// Get all necessary HTML elements by their IDs
let title = document.getElementById('title');
let price = document.getElementById('price');
let taxes = document.getElementById('taxes');
let ads = document.getElementById('ads');
let discount = document.getElementById('discount'); // Added discount element
let total = document.getElementById('total');
let count = document.getElementById('count');
let category = document.getElementById('category');
let submit = document.getElementById('submit');
let trio = document.getElementById('trio'); // The yellow div for update preview
let tbody = document.getElementById('tbody'); // Table body
let walletDisplay = document.getElementById('wallet'); // Wallet display element
let messageBox = document.getElementById('messageBox'); // Message box element

// Modal elements
let passwordModal = document.getElementById('passwordModal');
let passwordModalTitle = document.getElementById('passwordModalTitle');
let passwordInput = document.getElementById('passwordInput');
let passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
let passwordCancelBtn = document.getElementById('passwordCancelBtn');

let confirmationModal = document.getElementById('confirmationModal');
let confirmationMessage = document.getElementById('confirmationMessage');
let confirmYesBtn = document.getElementById('confirmYesBtn');
let confirmNoBtn = document.getElementById('confirmNoBtn');

let resetWalletBtn = document.getElementById('resetWalletBtn'); // New: Reset Wallet Button

// --- Initial Element Check (Debugging) ---
console.log("--- Initializing CRUDS App ---");
console.log("DEBUG: Title element:", title);
console.log("DEBUG: Price element:", price);
console.log("DEBUG: Submit button element:", submit); // Crucial check for the submit button
console.log("DEBUG: Message box element:", messageBox);
console.log("DEBUG: Password Modal elements:", passwordModal, passwordInput, passwordSubmitBtn);
console.log("DEBUG: Confirmation Modal elements:", confirmationModal, confirmationMessage, confirmYesBtn);
console.log("DEBUG: Reset Wallet Button:", resetWalletBtn);
console.log("----------------------------");


let dataPro; // Array to store product group objects

// Initialize dataPro from local storage or as an empty array
// This ensures dataPro is always an array from the very beginning.
try {
    if (localStorage.product != null) {
        dataPro = JSON.parse(localStorage.product);
        console.log("DEBUG: Initial dataPro loaded from localStorage.product (GLOBAL):", dataPro);
    } else {
        dataPro = [];
        console.log("DEBUG: localStorage.product is null, initializing dataPro as empty array (GLOBAL).");
    }
} catch (e) {
    console.warn("DEBUG: Error parsing localStorage.product during initial load (GLOBAL), initializing with empty array:", e);
    dataPro = []; // Fallback to empty array if parsing fails
}


let mood = 'create'; // Current mode: 'create' or 'update'
let tmpIndex; // Temporary variable to store the index of the item being updated

let nextGroupIdChar = 'A'; // To generate unique letter IDs for product groups (A, B, C...)
let walletBalance = 0; // Initialize wallet balance
let storedPassword = null; // To store the user's password

// --- Functions for Wallet Management ---

// Load wallet balance from local storage
function loadWallet() {
    if (localStorage.wallet != null) {
        walletBalance = parseFloat(localStorage.wallet);
        console.log("DEBUG: Wallet loaded from localStorage. Current balance:", walletBalance.toFixed(2));
    } else {
        walletBalance = 0;
        console.log("DEBUG: localStorage.wallet is null, initializing walletBalance to 0.");
    }
    updateWalletDisplay(); // Update the display immediately after loading
}

// Save wallet balance to local storage
function saveWallet() {
    localStorage.setItem('wallet', walletBalance.toFixed(2)); // Store as fixed 2 decimal places
    console.log("DEBUG: Wallet saved to localStorage. Current value in localStorage:", localStorage.getItem('wallet'));
}

// Update the wallet display on the UI
function updateWalletDisplay() {
    walletDisplay.innerHTML = `Wallet: $${walletBalance.toFixed(2)}`;
    console.log("DEBUG: Wallet display updated to:", walletDisplay.innerHTML);
}

// --- Password Management ---

// Load password from local storage
function loadPassword() {
    storedPassword = localStorage.getItem('appPassword');
    console.log("DEBUG: Loaded raw password data from localStorage (loadPassword):", localStorage.getItem('appPassword') ? "********" : "None"); // Raw string
    console.log("DEBUG: Stored password variable state (loadPassword):", storedPassword ? "********" : "None"); // Log masked password
}

// Save password to local storage
function savePassword(password) {
    localStorage.setItem('appPassword', password);
    storedPassword = password;
    // Added explicit checks to confirm storage immediately after setting
    console.log("DEBUG: Password saved to localStorage. Current value in localStorage (after setItem):", localStorage.getItem('appPassword') ? "********" : "None");
    console.log("DEBUG: Stored password variable state (after setItem):", storedPassword ? "********" : "None");
}

// Check if the entered password matches the stored one
function checkPassword(inputPassword) {
    const isMatch = inputPassword === storedPassword;
    console.log(`DEBUG: Password check: Entered='${inputPassword}', Stored='${storedPassword ? "********" : "None"}', Match=${isMatch}`);
    return isMatch;
}

// --- Message Box Function ---
function showMessage(message, type = 'info', duration = 5000) {
    console.log(`DEBUG: showMessage called: Message='${message}', Type='${type}'`);
    if (!messageBox) {
        console.error("DEBUG: Message box element not found!");
        return;
    }
    messageBox.textContent = message;
    messageBox.className = 'show'; // Show the message box
    messageBox.classList.add(type); // Add type class (e.g., 'error', 'success')

    // Hide the message box after 'duration' milliseconds
    setTimeout(() => {
        messageBox.classList.remove('show');
        // Remove type classes after hiding to reset for next message
        messageBox.classList.remove('error', 'success', 'info');
    }, duration);
}

// --- Custom Password Prompt Modal ---
let passwordCallback = null; // Stores the callback function for password prompt

function showPasswordPrompt(titleText, callback, showCancel = false) {
    console.log(`DEBUG: Showing password prompt: Title='${titleText}', Show Cancel=${showCancel}`);
    if (!passwordModal || !passwordInput || !passwordSubmitBtn || !passwordModalTitle) {
        console.error("DEBUG: Password modal elements not found!");
        return;
    }
    passwordModalTitle.textContent = titleText;
    passwordInput.value = ''; // Clear previous input
    passwordModal.classList.add('show');
    passwordInput.focus();
    passwordCallback = callback;

    if (showCancel) {
        passwordCancelBtn.classList.remove('hidden');
    } else {
        passwordCancelBtn.classList.add('hidden');
    }
}

function hidePasswordPrompt() {
    console.log("DEBUG: Hiding password prompt.");
    if (passwordModal) {
        passwordModal.classList.remove('show');
    }
    // passwordCallback is nulled by the button click handlers after execution
}

// Event listener for password submit button
if (passwordSubmitBtn) {
    passwordSubmitBtn.onclick = function () {
        console.log("DEBUG: Password submit button clicked.");
        const enteredPassword = passwordInput.value;
        // Execute callback FIRST, then hide and nullify
        if (passwordCallback) {
            console.log("DEBUG: Calling passwordCallback with:", enteredPassword === null ? "CANCELLED" : `'${enteredPassword}'`);
            passwordCallback(enteredPassword);
        }
        hidePasswordPrompt(); // Hide modal after callback
        passwordCallback = null; // Nullify after execution
    };
}

// Event listener for password cancel button
if (passwordCancelBtn) {
    passwordCancelBtn.onclick = function () {
        console.log("DEBUG: Password cancel button clicked.");
        // Execute callback FIRST, then hide and nullify
        if (passwordCallback) {
            console.log("DEBUG: Calling passwordCallback with: CANCELLED (null)");
            passwordCallback(null); // Indicate cancellation
        }
        hidePasswordPrompt(); // Hide modal after callback
        passwordCallback = null; // Nullify after execution
    };
}

// --- Custom Confirmation Dialog Modal ---
let confirmationCallback = null; // Stores the callback function for confirmation dialog

function showConfirmationDialog(message, callback) {
    console.log(`DEBUG: Showing confirmation dialog: Message='${message}'`);
    if (!confirmationModal || !confirmationMessage || !confirmYesBtn || !confirmNoBtn) {
        console.error("DEBUG: Confirmation modal elements not found!");
        return;
    }
    confirmationMessage.textContent = message;
    confirmationModal.classList.add('show');
    confirmationCallback = callback;
}

// *** CRITICAL CHANGE HERE ***
// Removed `confirmationCallback = null;` from this function.
// It will now be handled by the individual button click handlers.
function hideConfirmationDialog() {
    console.log("DEBUG: Hiding confirmation dialog.");
    if (confirmationModal) {
        confirmationModal.classList.remove('show');
    }
}

// Event listener for confirmation Yes button
if (confirmYesBtn) {
    confirmYesBtn.onclick = function () {
        console.log("DEBUG: Confirmation Yes button clicked.");
        // Execute callback FIRST, then hide and nullify
        if (confirmationCallback) {
            confirmationCallback(true);
            console.log("DEBUG: Confirmation callback executed with true.");
        }
        hideConfirmationDialog(); // Hide modal
        confirmationCallback = null; // Nullify after execution
    };
}

// Event listener for confirmation No button
if (confirmNoBtn) {
    confirmNoBtn.onclick = function () {
        console.log("DEBUG: Confirmation No button clicked.");
        // Execute callback FIRST, then hide and nullify
        if (confirmationCallback) {
            confirmationCallback(false);
            console.log("DEBUG: Confirmation callback executed with false.");
        }
        hideConfirmationDialog(); // Hide modal
        confirmationCallback = null; // Nullify after execution
    };
}

// --- Core Application Logic ---

// Function to calculate and display the total price
function getTotal() {
    // Ensure price, taxes, ads, and discount are treated as numbers
    let priceVal = parseFloat(price.value) || 0;
    let taxesVal = parseFloat(taxes.value) || 0;
    let adsVal = parseFloat(ads.value) || 0;
    let discountVal = parseFloat(discount.value) || 0;

    if (price.value !== '') {
        let result = (priceVal + taxesVal + adsVal) - discountVal;
        total.innerHTML = result.toFixed(2); // Format to 2 decimal places
        total.style.background = "#040"; // Green background for valid total
    } else {
        total.innerHTML = ''; // Clear total if price is empty
        total.style.background = "#a00d02"; // Red background for invalid total
    }
}

// Function to check if there's any data and toggle table/empty message visibility
function checkData() {
    console.log("DEBUG: checkData called. dataPro length:", dataPro.length);
    if (dataPro.length > 0) {
        document.getElementById('empty').style.display = 'none';
        document.getElementById('table').style.display = 'table';
    } else {
        document.getElementById('empty').style.display = 'block';
        document.getElementById('table').style.display = 'none';
    }
}

// Function to generate the next unique group ID (e.g., A, B, C...)
function getNextGroupId() {
    let maxChar = 'A'.charCodeAt(0); // Start with 'A' as the minimum
    if (dataPro.length === 0) {
        nextGroupIdChar = 'A'; // Reset if no data
        console.log("DEBUG: dataPro is empty, nextGroupIdChar reset to 'A'.");
    } else {
        for (let i = 0; i < dataPro.length; i++) {
            // Added a check to ensure dataPro[i] and dataPro[i].groupId exist
            if (dataPro[i] && dataPro[i].groupId) {
                const currentGroupChar = dataPro[i].groupId.charCodeAt(0);
                if (currentGroupChar >= maxChar) { // Use >= to find the highest char
                    maxChar = currentGroupChar;
                }
            } else {
                console.warn(`DEBUG: Skipping malformed data entry at index ${i}:`, dataPro[i]);
            }
        }
        nextGroupIdChar = String.fromCharCode(maxChar + 1); // Increment the highest char found
        console.log(`DEBUG: Determined nextGroupIdChar: ${nextGroupIdChar} (based on max existing char code: ${String.fromCharCode(maxChar)})`);
    }
    return nextGroupIdChar;
}


// Event listener for the 'Create'/'Update' button
if (submit) { // Ensure submit button exists before assigning onclick
    submit.onclick = function () {
        try {
            console.log("DEBUG: Submit button clicked!");

            // Calculate total before creating/updating
            getTotal();

            let newProGroup = {
                title: title.value.toLowerCase(),
                price: price.value,
                taxes: taxes.value,
                ads: ads.value,
                discount: discount.value,
                total: total.innerHTML,
                category: category.value.toLowerCase(),
                initialCount: parseInt(count.value) || 1,
                currentCount: parseInt(count.value) || 1,
                productIds: []
            };

            console.log("DEBUG: New Product Group data:", newProGroup);

            // Input validation
            if (title.value !== '' && price.value !== '' && category.value !== '' && newProGroup.initialCount > 0 && newProGroup.initialCount < 1000) { // Added count > 0 and increased max count for flexibility
                console.log("DEBUG: Validation passed!");
                if (mood === 'create') {
                    newProGroup.groupId = getNextGroupId(); // Get a new unique group ID
                    for (let i = 1; i <= newProGroup.initialCount; i++) {
                        newProGroup.productIds.push(`${newProGroup.groupId}${i}`);
                    }
                    dataPro.push(newProGroup);
                    console.log("DEBUG: Product created. dataPro length:", dataPro.length);
                    showMessage("Product created successfully!", "success");
                } else { // Mood is 'update' - password check is done in updateData()
                    console.log("DEBUG: Processing update after password validation.");
                    // This block is reached after password validation in updateData()
                    dataPro[tmpIndex].title = newProGroup.title;
                    dataPro[tmpIndex].price = newProGroup.price;
                    dataPro[tmpIndex].taxes = newProGroup.taxes;
                    dataPro[tmpIndex].ads = newProGroup.ads;
                    dataPro[tmpIndex].discount = newProGroup.discount;
                    dataPro[tmpIndex].total = newProGroup.total;
                    dataPro[tmpIndex].category = newProGroup.category;

                    // Only update counts and productIds if initialCount has changed
                    if (dataPro[tmpIndex].initialCount !== newProGroup.initialCount) {
                        dataPro[tmpIndex].initialCount = newProGroup.initialCount;
                        dataPro[tmpIndex].currentCount = newProGroup.initialCount;
                        dataPro[tmpIndex].productIds = []; // Regenerate product IDs
                        for (let i = 1; i <= newProGroup.initialCount; i++) {
                            dataPro[tmpIndex].productIds.push(`${dataPro[tmpIndex].groupId}${i}`);
                        }
                    }

                    mood = 'create';
                    submit.innerHTML = 'Create';
                    count.style.display = 'block';
                    trio.innerHTML = '';
                    trio.style.display = 'none';
                    showMessage("Product updated successfully!", "success");
                }
                clearData();
            } else {
                console.log("DEBUG: Validation failed! Input values:", {
                    title: title.value,
                    price: price.value,
                    category: category.value,
                    count: newProGroup.initialCount
                });
                showMessage("Please fill all required fields (Title, Price, Category) and ensure Count is a positive number less than 1000.", "error");
            }

            localStorage.setItem('product', JSON.stringify(dataPro));
            console.log("DEBUG: Data saved to local storage. 'product' key value:", localStorage.getItem('product'));
            showData();
            checkData();
        } catch (error) {
            console.error("DEBUG: An error occurred during product creation/update:", error);
            showMessage("An unexpected error occurred. Check console for details.", "error");
        }
    };
} else {
    console.error("DEBUG: Submit button with ID 'submit' not found!");
}


// Function to clear all input fields
function clearData() {
    console.log("DEBUG: clearData called.");
    title.value = '';
    price.value = '';
    taxes.value = '';
    ads.value = '';
    discount.value = '';
    total.innerHTML = '';
    count.value = '';
    category.value = '';
    getTotal(); // Recalculate total to reset its background
}

// Function to display data in the table
function showData() {
    console.log("DEBUG: showData called. Current dataPro length:", dataPro.length);
    console.log("DEBUG: dataPro contents at start of showData:", JSON.stringify(dataPro));

    trio.style.display = 'none';
    getTotal();

    let table = '';
    if (dataPro.length === 0) {
        console.log("DEBUG: dataPro is empty, no table rows will be generated.");
    }

    for (let i = 0; i < dataPro.length; i++) {
        const group = dataPro[i];
        // Relaxed condition: Only check for essential properties to be present
        // (groupId, title, price, category, currentCount)
        if (group && group.groupId && group.title && group.price && group.category && typeof group.currentCount !== 'undefined') {
            console.log(`DEBUG: showData - Building row for group ${i}: ${group.title}, currentCount: ${group.currentCount}`);
            // Ensure productIds is an array before joining
            const productIdsDisplay = Array.isArray(group.productIds) ? group.productIds.join(', ') : '';
            table += `
            <tr id='tr-${group.groupId}'>
                <td>${group.groupId}</td>
                <td>${group.title}</td>
                <td>${group.price}</td>
                <td>${group.taxes}</td>
                <td>${group.ads}</td>
                <td>${group.discount}</td>
                <td>${group.total}</td>
                <td>${group.category}</td>
                <td>${group.currentCount} (${productIdsDisplay})</td>
                <td><button id="update" onclick="updateData(${i})">Update</button></td>
                <td><button id="delete" onclick="deleteData(${i})">Delete</button></td>
                <td><button id="sell" onclick="sellProduct(${i})">Sell</button></td>
            </tr>`;
        } else {
            console.warn(`DEBUG: showData - Skipping malformed product group entry at index ${i}:`, group);
            // You might want to log the specific missing property here for more debugging
            if (!group) console.warn("Group is null/undefined");
            else if (!group.groupId) console.warn("group.groupId is missing");
            else if (!group.title) console.warn("group.title is missing");
            else if (!group.price) console.warn("group.price is missing");
            else if (!group.category) console.warn("group.category is missing");
            else if (typeof group.currentCount === 'undefined') console.warn("group.currentCount is undefined");
        }
    }

    console.log("DEBUG: showData - Finished building table HTML. Generated HTML length:", table.length);
    console.log("DEBUG: showData - Generated HTML starts with:", table.substring(0, 200)); // Log part of the generated HTML

    tbody.innerHTML = table; // Update the table body
    console.log("DEBUG: showData - tbody.innerHTML updated. Current tbody HTML:", tbody.innerHTML.substring(0, 200)); // Log current tbody HTML

    let btnDeleteAll = document.getElementById('deleteAll');
    if (dataPro.length > 0) {
        btnDeleteAll.innerHTML = `
        <button onclick='deleteAll()'>Delete All (${dataPro.length})</button>`;
        console.log("DEBUG: showData - Delete All button displayed with count:", dataPro.length);
    } else {
        btnDeleteAll.innerHTML ='';
        console.log("DEBUG: showData - Delete All button hidden (no data).");
    }
    // ensure checkData is called here to toggle table visibility
    checkData();
    console.log("DEBUG: showData - Function finished.");
}

// Function to delete a single product group (requires password and confirmation)
function deleteData(i) {
    console.log("DEBUG: Attempting to delete product at index:", i);
    showPasswordPrompt("Enter Password to Delete", (enteredPassword) => {
        console.log("CALLBACK DEBUG: Delete password callback received. Entered:", enteredPassword === null ? "CANCELLED" : `'${enteredPassword}'`);
        if (enteredPassword === null) {
            showMessage("Operation cancelled.", "info");
        } else if (enteredPassword === '') {
            showMessage("Password cannot be empty. Deletion denied.", "error");
        } else if (checkPassword(enteredPassword)) {
            console.log("CALLBACK DEBUG: Password correct for deletion. Proceeding to confirmation.");
            showConfirmationDialog("Are you sure you want to delete this product group?", (confirmed) => {
                console.log("CALLBACK DEBUG: Confirmation for delete received:", confirmed);
                if (confirmed) {
                    dataPro.splice(i, 1); // Remove the product group from the array
                    localStorage.setItem('product', JSON.stringify(dataPro)); // Update local storage
                    showMessage("Product group deleted.", "info");
                    showData(); // Refresh the table
                    checkData(); // Re-check data presence
                } else {
                    showMessage("Deletion cancelled.", "info");
                }
            });
        } else {
            showMessage("Incorrect password. Deletion denied.", "error");
        }
    }, true); // Show cancel button for password prompt
}

// Function to delete all product groups (requires password and confirmation)
function deleteAll() {
    console.log("DEBUG: Attempting to delete all products.");
    showPasswordPrompt("Enter Password to Delete All", (enteredPassword) => {
        console.log("CALLBACK DEBUG: Delete All password callback received. Entered:", enteredPassword === null ? "CANCELLED" : `'${enteredPassword}'`);
        if (enteredPassword === null) {
            showMessage("Operation cancelled.", "info");
        } else if (enteredPassword === '') {
            showMessage("Password cannot be empty. Deletion denied.", "error");
        } else if (checkPassword(enteredPassword)) {
            console.log("CALLBACK DEBUG: Password correct for delete all. Proceeding to confirmation.");
            showConfirmationDialog("Are you sure you want to delete ALL product groups? This cannot be undone.", (confirmed) => {
                console.log("CALLBACK DEBUG: Confirmation for delete all received:", confirmed);
                if (confirmed) {
                    // *** IMPORTANT CHANGE HERE ***
                    // Only remove the 'product' key, not clear all local storage
                    localStorage.removeItem('product');
                    dataPro = []; // Clear the data array
                    nextGroupIdChar = 'A'; // Reset next group ID
                    showMessage("All products deleted.", "info");
                    showData(); // Refresh the table
                    checkData(); // Re-check data presence
                    // No need to loadWallet here, as it's not being reset by this action.
                    // Wallet state will persist unless reset explicitly.
                } else {
                    showMessage("Deletion cancelled.", "info");
                }
            });
        } else {
            showMessage("Incorrect password. Deletion denied.", "error");
        }
    }, true); // Show cancel button for password prompt
}

// Function to populate input fields for updating a product group (requires password)
function updateData(i) {
    console.log("DEBUG: Attempting to update product at index:", i);
    showPasswordPrompt("Enter Password to Update", (enteredPassword) => {
        console.log("CALLBACK DEBUG: Update password callback received. Entered:", enteredPassword === null ? "CANCELLED" : `'${enteredPassword}'`);
        if (enteredPassword === null) {
            showMessage("Operation cancelled.", "info");
        } else if (enteredPassword === '') {
            showMessage("Password cannot be empty. Update denied.", "error");
        } else if (checkPassword(enteredPassword)) {
            console.log("CALLBACK DEBUG: Password correct for update. Loading data into form.");
            let group = dataPro[i];
            title.value = group.title;
            price.value = group.price;
            taxes.value = group.taxes;
            ads.value = group.ads;
            discount.value = group.discount;
            getTotal(); // Recalculate total based on loaded values
            count.value = group.initialCount; // Show initial count in the input
            count.style.display = 'block'; // Ensure count input is visible for update
            category.value = group.category;

            submit.innerHTML = 'Update'; // Change button text to 'Update'
            mood = 'update'; // Set mood to update
            tmpIndex = i; // Store the index of the item being updated

            // Display formatted properties in the trio div
            trio.style.display = 'block';
            const productIdsDisplay = Array.isArray(group.productIds) ? group.productIds.join(', ') : '';
            trio.innerHTML = `
                <strong>Updating Group ${group.groupId}:</strong><br>
                Title: ${group.title}<br>
                Price: ${group.price}<br>
                Taxes: ${group.taxes}<br>
                Ads: ${group.ads}<br>
                Discount: ${group.discount}<br>
                Total: ${group.total}<br>
                Category: ${group.category}<br>
                Current Count: ${group.currentCount} (IDs: ${productIdsDisplay})
            `;

            // Scroll to the top of the page for better UX
            scroll({
                top: 0,
                behavior: "smooth"
            });
            showMessage("Ready to update product. Make your changes and click 'Update'.", "info");
        } else {
            showMessage("Incorrect password. Update denied.", "error");
        }
    }, true); // Show cancel button for password prompt
    // showData() is not needed here as it will be called after the update is confirmed and submitted.
}

// Function to handle selling products from a group
function sellProduct(i) {
    let group = dataPro[i];
    if (group.currentCount === 0) {
        showMessage("No more products to sell in this group!", "error");
        showData();
        return;
    }

    // Using custom modal for amount input
    // NOTE: For simplicity, the sell amount input is re-using the password modal structure.
    // In a real application, you might want a dedicated numeric input modal.
    showPasswordPrompt(`Enter amount to sell from "${group.title}" (Max: ${group.currentCount}):`, (amountInput) => {
        console.log("CALLBACK DEBUG: Sell amount callback received. Entered:", amountInput === null ? "CANCELLED" : `'${amountInput}'`);
        if (amountInput === null) { // User cancelled the prompt
            showMessage("Sell operation cancelled.", "info");
            return;
        }
        let amountToSell = parseInt(amountInput);

        // Validate input
        if (isNaN(amountToSell) || amountToSell <= 0 || amountToSell > group.currentCount) {
            showMessage("Invalid amount. Please enter a positive number not exceeding the current count.", "error");
            return;
        }

        // Calculate value of sold products
        let unitPrice = parseFloat(group.total);
        let soldValue = amountToSell * unitPrice;

        // Update wallet balance
        walletBalance += soldValue;
        saveWallet(); // Save updated wallet balance
        updateWalletDisplay(); // Update wallet display on UI

        // Decrease product count and remove sold product IDs
        group.currentCount -= amountToSell;
        if (Array.isArray(group.productIds)) { // Ensure productIds is an array before splicing
            group.productIds.splice(0, amountToSell); // Remove from the beginning of the array
        }


        // If count drops to 0, remove the entire group
        if (group.currentCount === 0) {
            dataPro.splice(i, 1);
            showMessage(`All products from "${group.title}" sold out! Group removed.`, "success");
        } else {
            showMessage(`${amountToSell} products from "${group.title}" sold. Wallet updated!`, "success");
        }

        localStorage.setItem('product', JSON.stringify(dataPro)); // Update local storage
        showData(); // Refresh the table
        checkData(); // Re-check data presence
    }, false); // No cancel button for sell amount input, as it's a numeric input
}

// --- Reset Wallet Function (requires password) ---
if (resetWalletBtn) {
    resetWalletBtn.onclick = function () {
        console.log("DEBUG: Reset Wallet button clicked.");
        showPasswordPrompt("Enter Password to Reset Wallet", (enteredPassword) => {
            console.log("CALLBACK DEBUG: Reset Wallet password callback received. Entered:", enteredPassword === null ? "CANCELLED" : `'${enteredPassword}'`);
            if (enteredPassword === null) {
                showMessage("Operation cancelled.", "info");
            } else if (enteredPassword === '') {
                showMessage("Password cannot be empty. Wallet reset denied.", "error");
            } else if (checkPassword(enteredPassword)) {
                console.log("CALLBACK DEBUG: Password correct for wallet reset. Proceeding to confirmation.");
                showConfirmationDialog("Are you sure you want to reset your wallet to $0.00? This cannot be undone.", (confirmed) => {
                    console.log("CALLBACK DEBUG: Confirmation for wallet reset received:", confirmed);
                    if (confirmed) {
                        walletBalance = 0;
                        saveWallet();
                        updateWalletDisplay();
                        showMessage("Wallet reset successfully!", "success");
                    } else {
                        showMessage("Wallet reset cancelled.", "info");
                    }
                });
            } else {
                showMessage("Incorrect password. Wallet reset denied.", "error");
            }
        }, true); // Show cancel button for password prompt
    };
}


// --- Search Functionality ---

let searchMood = 'title'; // Default search mood

// Function to set the search mood (by title or category)
function getSearchMood(id) {
    console.log(`DEBUG: Setting search mood to: ${id}`);
    let searchInput = document.getElementById('search');
    if (id === 'searchTitle') {
        searchMood = 'title';
        searchInput.placeholder = 'Search By Title';
    } else {
        searchMood = 'category';
        searchInput.placeholder = 'Search By Category';
    }
    searchInput.focus(); // Focus on the search input
    searchInput.value = ''; // Clear search input
    showData(); // Show all data when changing search mood
    checkData(); // Re-check data presence
}

// Function to perform search and display results
function searchData(value) {
    console.log(`DEBUG: Searching for '${value}' by ${searchMood}.`);
    let table = '';
    // Iterate through each product group
    for (let i = 0; i < dataPro.length; i++) {
        const group = dataPro[i];
        const productIdsDisplay = Array.isArray(group.productIds) ? group.productIds.join(', ') : '';

        if (searchMood === 'title') {
            // Search by title (case-insensitive)
            if (group.title.toLowerCase().includes(value.toLowerCase())) {
                table += `
                <tr id='tr-${group.groupId}'>
                    <td>${group.groupId}</td>
                    <td>${group.title}</td>
                    <td>${group.price}</td>
                    <td>${group.taxes}</td>
                    <td>${group.ads}</td>
                    <td>${group.discount}</td>
                    <td>${group.total}</td>
                    <td>${group.category}</td>
                    <td>${group.currentCount} (${productIdsDisplay})</td>
                    <td><button id="update" onclick="updateData(${i})">Update</button></td>
                    <td><button id="delete" onclick="deleteData(${i})">Delete</button></td>
                    <td><button id="sell" onclick="sellProduct(${i})">Sell</button></td>
                </tr>`;
            }
        } else { // searchMood === 'category'
            // Search by category (case-insensitive)
            if (group.category.toLowerCase().includes(value.toLowerCase())) {
                table += `
                <tr id='tr-${group.groupId}'>
                    <td>${group.groupId}</td>
                    <td>${group.title}</td>
                    <td>${group.price}</td>
                    <td>${group.taxes}</td>
                    <td>${group.ads}</td>
                    <td>${group.discount}</td>
                    <td>${group.total}</td>
                    <td>${group.category}</td>
                    <td>${group.currentCount} (${productIdsDisplay})</td>
                    <td><button id="update" onclick="updateData(${i})">Update</button></td>
                    <td><button id="delete" onclick="deleteData(${i})">Delete</button></td>
                    <td><button id="sell" onclick="sellProduct(${i})">Sell</button></td>
                </tr>`;
            }
        }
    }
    tbody.innerHTML = table; // Update the table body with search results
    checkData(); // Re-check data presence (important if search results in empty table)
}


// --- Centralized App Initialization ---
function initializeApp() {
    console.log("DEBUG: initializeApp called.");
    loadWallet(); // Load wallet balance
    // dataPro is already loaded at global scope
    getNextGroupId(); // Determine next group ID based on loaded data
    showData(); // Display products in the table
    checkData(); // Check and toggle table/empty message visibility
}


// --- Initial Calls on Page Load ---
window.onload = function() {
    console.log("DEBUG: window.onload fired.");
    loadPassword(); // Load stored password first

    // If no password is set, prompt the user to set one
    if (storedPassword === null) {
        console.log("DEBUG: No password found, prompting user to set one.");
        showPasswordPrompt("Set Your New Password", (newPassword) => {
            console.log("CALLBACK DEBUG: Initial password setup callback received. Entered:", newPassword === null ? "CANCELLED" : `'${newPassword}'`);
            if (newPassword) {
                savePassword(newPassword);
                showMessage("Password set successfully! Remember it.", "success");
            } else {
                showMessage("Password not set. Some features may be restricted.", "error");
            }
            // IMPORTANT: Call initializeApp AFTER password setup/cancellation
            initializeApp();
        }, false); // Do not show cancel button for initial password setup
    } else {
        console.log("DEBUG: Password found, proceeding with app initialization.");
        // If password is already set, just continue with app initialization
        initializeApp();
    }
};
