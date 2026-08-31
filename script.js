// Change this number as your vending machine fund grows.
const currentAmount = 0;

const goalAmount = 5000;

const percentage = Math.min(
    (currentAmount / goalAmount) * 100,
    100
);

window.addEventListener("load", () => {
    document.getElementById("progress").style.width =
        percentage + "%";
});
