let random = (nbOccurence = 5, minimum = 0, maximum = 10) => {
    if (minimum >= maximum || nbOccurence <= 0) return -1
    else {
        let resultat = []
        for (let i = 0; i < nbOccurence; ++i) {
            let calculmax = maximum - minimum + 1
            resultat.push(Math.floor(Math.random() * calculmax + minimum))
        }
        if (resultat.length == 1) return parseInt(resultat)
        else return resultat
    }
}

let playerName = "Joueur"
let scoreIA = 0
let playerScore = 0
document.querySelector(".playerName").innerHTML = document.querySelector(".playerName").innerHTML.replace("[PlayerName]", playerName)
document.querySelector(".scoreIA").innerHTML = scoreIA
document.querySelector(".playerScore").innerHTML = playerScore

const changeName = (e) => {
    if (e.key == "Enter") {
        if (document.querySelector("#playerName").value != "") {
            let oldPlayerName = playerName
            playerName = document.querySelector("#playerName").value
            document.querySelector(".playerName").innerText = document.querySelector(".playerName").innerText.replace(oldPlayerName, playerName)
            document.querySelector("#playerName").value = ""
            document.querySelector(".changeName").classList.remove("affiche")

        }
    } else document.querySelector(".changeName").classList.add("affiche")

}

const playerChoice = (e) => {
    e.target.classList.add("select")
    switch (e.target.classList[1]) {

        case "pierre":
            choicePlayer = 1
            document.querySelector(".choicePlayer").innerHTML = "Pierre"
            break;
        case "feuille":
            choicePlayer = 2
            document.querySelector(".choicePlayer").innerHTML = "Feuille"
            break;
        case "ciseaux":
            choicePlayer = 3
            document.querySelector(".choicePlayer").innerHTML = "Ciseaux"
            break;
    }

    // Stylisation des non sélectionés
    let buttons = document.querySelectorAll(".button")
    for (let i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = true
        if (buttons[i].classList.length == 2) buttons[i].classList.add("noselect")
    }

    // Déclenchement du jeu
    let gagnant = 0
    let choiceIA = random(1, 1, 3)
    if (choicePlayer == choiceIA) gagnant = 0
    else if (choicePlayer == 1 && choiceIA == 2) gagnant = 1
    else if (choicePlayer == 1 && choiceIA == 3) gagnant = 2
    else if (choicePlayer == 2 && choiceIA == 1) gagnant = 2
    else if (choicePlayer == 2 && choiceIA == 3) gagnant = 1
    else if (choicePlayer == 3 && choiceIA == 1) gagnant = 1
    else if (choicePlayer == 3 && choiceIA == 2) gagnant = 2

    switch (choiceIA) {
        case 1:
            document.querySelector(".choiceIA").innerHTML = "Pierre"
            break;
        case 2:
            document.querySelector(".choiceIA").innerHTML = "Feuille"
            break;
        case 3:
            document.querySelector(".choiceIA").innerHTML = "Ciseaux"
            break;
    }

    // Calcul des scores
    let winnerText = ""
    switch (gagnant) {
        case 0:
            winnerText = "Egalité. Personne ne gagne de point."
            break;
        case 1:
            winnerText = "l'IA gagne un point"
            scoreIA++
            break;
        case 2:
            winnerText = document.querySelector(".playerName").innerText + " gagne un point"
            playerScore++
            break;
    }
    document.querySelector(".winner").innerHTML = winnerText
    setTimeout(updateScore, 2000)
}

const updateScore = () => {
    document.querySelector(".scoreIA").innerHTML = scoreIA
    document.querySelector(".playerScore").innerHTML = playerScore
    document.querySelector(".winner").innerHTML = "Tu peux rejouer"
    // Remise à zéro des boutons
    for (let i = 0; i < myButtons.length; ++i) {
        myButtons[i].classList.remove("select")
        myButtons[i].classList.remove("noselect")
    }
}

const messageBox = (type = "info", title = "", message = "", reponses = ["OK"], fonction=["closeModal"]) => {
    switch (type) {
        case "info":
            document.querySelector(".messageBox").style.backgroundColor = "var(--color-secondary)"

            break;

        case "error":
            document.querySelector(".messageBox").style.backgroundColor = "var(--color-error)"
            break;

        case "question":
            document.querySelector(".messageBox").style.backgroundColor = "var(--color-question)"
            
            break;
    }
    for (let i=0; i<reponses.length; ++i)
            {
                newButton = document.createElement("button")
                let reponsesTag = document.querySelector(".reponses")
                newButton.innerHTML=reponses[i]
                //newButton.addEventListener("click", fonction[i])
                reponsesTag.appendChild(newButton)
            }
    document.querySelector(".messageBox h3").innerHTML = title
    document.querySelector(".messageBox p").innerHTML = message

    document.querySelector(".messageBox").style.display = "block"
    document.querySelector(".messageBox").style.opacity = 1

}

const closeModal = () =>
{
    document.querySelector(".messageBox").style.display="none"
}

//messageBox("", "Mon information", "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minima deserunt cumque necessitatibus nemo velit iure, similique possimus accusamus consectetur eius corporis eos molestias? Veritatis dicta aut eum dolore expedita laudantium!")

const reset = (e) => {
    location.reload()
}

document.querySelector(".changePlayerName").addEventListener("click", changeName)
document.querySelector("#playerName").addEventListener("keydown", changeName)
let myButtons = document.querySelectorAll(".button")
for (let i = 0; i < myButtons.length; ++i) {
    myButtons[i].addEventListener("click", playerChoice)
}

let choicePlayer = 0