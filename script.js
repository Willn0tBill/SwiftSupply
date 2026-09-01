/* =========================
   SWIFTSUPPLY SETTINGS
========================= */

// Update this number whenever your
// vending machine fund increases.

const currentAmount = 0;

const goalAmount = 5000;


/* =========================
   ACTIVE NAVIGATION
========================= */

const sections =
    document.querySelectorAll(
        "section[id]"
    );


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


function updateActiveNavigation() {

    let currentSection = "home";


    sections.forEach(
        (section) => {

            const sectionTop =
                section.offsetTop;


            const sectionHeight =
                section.offsetHeight;


            const scrollPosition =
                window.scrollY + 180;


            if (

                scrollPosition >=
                sectionTop

                &&

                scrollPosition <
                sectionTop +
                sectionHeight

            ) {

                currentSection =
                    section.getAttribute(
                        "id"
                    );

            }

        }
    );


    navLinks.forEach(
        (link) => {

            link.classList.remove(
                "active"
            );


            if (

                link.getAttribute(
                    "href"
                ) ===
                "#" + currentSection

            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNavigation
);


window.addEventListener(
    "load",
    updateActiveNavigation
);


/* =========================
   VENDING FUND PROGRESS
========================= */

function updateFundProgress() {

    const progress =
        document.getElementById(
            "progress"
        );


    const amountDisplay =
        document.getElementById(
            "currentAmount"
        );


    if (
        !progress ||
        !amountDisplay
    ) {

        return;

    }


    const percentage =
        Math.min(

            (
                currentAmount /
                goalAmount
            ) * 100,

            100

        );


    progress.style.width =
        percentage + "%";


    amountDisplay.textContent =
        "$" +
        currentAmount.toLocaleString();

}


window.addEventListener(
    "load",
    updateFundProgress
);


/* =========================
   ORDER MODAL
========================= */

const modal =
    document.getElementById(
        "orderModal"
    );


const closeModalButton =
    document.getElementById(
        "closeModal"
    );


const orderButtons =
    document.querySelectorAll(
        ".order-button"
    );


const formTitle =
    document.getElementById(
        "formTitle"
    );


const formDescription =
    document.getElementById(
        "formDescription"
    );


const orderType =
    document.getElementById(
        "orderType"
    );


const organizationField =
    document.getElementById(
        "organizationField"
    );


const nameInput =
    document.getElementById(
        "name"
    );


/* =========================
   OPEN ORDER FORM
========================= */

function openOrderForm(type) {

    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );


    if (
        type === "organization"
    ) {

        formTitle.textContent =
            "Bulk & Organization Order";


        formDescription.textContent =
            "Tell us what your club or organization needs, and we will review your request.";


        orderType.value =
            "Bulk / Organization Order";


        organizationField.style.display =
            "block";

    }


    if (
        type === "drinks"
    ) {

        formTitle.textContent =
            "Order Drinks";


        formDescription.textContent =
            "Tell us which drinks and quantities you would like to request.";


        orderType.value =
            "Drink Order";


        organizationField.style.display =
            "none";

    }


    if (
        type === "snacks"
    ) {

        formTitle.textContent =
            "Order Snacks";


        formDescription.textContent =
            "Tell us which snacks and quantities you would like to request.";


        orderType.value =
            "Snack Order";


        organizationField.style.display =
            "none";

    }


    setTimeout(
        () => {

            nameInput.focus();

        },
        100
    );

}


/* =========================
   CLOSE ORDER FORM
========================= */

function closeOrderForm() {

    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================
   ORDER BUTTON EVENTS
========================= */

orderButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",

            () => {

                const type =
                    button.dataset.orderType;


                openOrderForm(
                    type
                );

            }

        );

    }
);


/* =========================
   CLOSE BUTTON
========================= */

closeModalButton.addEventListener(
    "click",
    closeOrderForm
);


/* =========================
   CLICK OUTSIDE MODAL
========================= */

modal.addEventListener(
    "click",

    (event) => {

        if (
            event.target === modal
        ) {

            closeOrderForm();

        }

    }
);


/* =========================
   ESCAPE KEY
========================= */

document.addEventListener(
    "keydown",

    (event) => {

        if (

            event.key === "Escape"

            &&

            modal.classList.contains(
                "show"
            )

        ) {

            closeOrderForm();

        }

    }
);


/* =========================
   CONTACT VALIDATION
========================= */

const contactMethod =
    document.getElementById(
        "contactMethod"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const phoneInput =
    document.getElementById(
        "phone"
    );


contactMethod.addEventListener(
    "change",

    () => {

        if (
            contactMethod.value ===
            "Email"
        ) {

            emailInput.required =
                true;


            phoneInput.required =
                false;

        }


        else if (
            contactMethod.value ===
            "Phone"
        ) {

            emailInput.required =
                false;


            phoneInput.required =
                true;

        }


        else {

            emailInput.required =
                false;


            phoneInput.required =
                false;

        }

    }
);


/* =========================
   INITIAL PAGE SETUP
========================= */

document.addEventListener(
    "DOMContentLoaded",

    () => {

        updateActiveNavigation();

        updateFundProgress();

    }
);
/* =========================
   SCROLL REVEAL ANIMATIONS
========================= */

const revealElements =
    document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right"
    );


const revealObserver =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                    }

                }
            );

        },

        {
            threshold: 0.15
        }

    );


revealElements.forEach(
    (element) => {

        revealObserver.observe(
            element
        );

    }
);
