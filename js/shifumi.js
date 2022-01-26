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

// taux de réussite du l'IA
let savePlayerChoix = []
let savePlayerChoixLevel3 = []
let choice = [0, 0, 0]
let nbJeux = 0
// Nb de jeux avant l'activation de la triche
let activateCheat = 5

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
    // Lancement du jeu selon le niveau
    let game
    nbJeux++
    let choiceLevel = document.querySelector("#level").value
    if (choiceLevel == 1) game = gameLevelOne()
    else if (choiceLevel == 2) game = gameLevelTwo()
    else if (choiceLevel == 3) game = gameLevelThree()
    // Met à jour les scores
    calculScore(game)
}

const gameLevelOne = () => {
    let winner = 0
    let choiceIA = random(1, 1, 3)
    winner = theWinnerIs(choiceIA)
    displayChoiceIA(choiceIA)
    return winner
}


const gameLevelTwo = () => {
    // Memorisation du choix du joueur
    savePlayerChoix.push(choicePlayer)
    choice[choicePlayer - 1]++
    let choiceMaxIndice = -1
    let choiceMax = 0
    for (i in choice) {
        if (choice[i] > choiceMax) {
            choiceMax = choice[i]
            choiceMaxIndice = i
        }
    }
    choiceMaxIndice = parseInt(choiceMaxIndice)
    let winner = 0
    let choiceIA
    if (nbJeux > activateCheat) {
        let choiceRamdon = random(1, 1, 3)
        while (choiceRamdon == (choiceMaxIndice + 1)) {
            choiceRamdon = random(1, 1, 3)
        }
        choiceIA = choiceRamdon
    } else choiceIA = random(1, 1, 3)
    winner = theWinnerIs(choiceIA)
    displayChoiceIA(choiceIA)
    return winner
}

const gameLevelThree = () => {

    let winner = 0
    let choiceIA
    if (nbJeux > activateCheat && nbJeux > 2) {
        choice = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (let i = 0; i < savePlayerChoixLevel3.length; ++i) {
            if (i != 0) {
                let choiceIAOld = savePlayerChoixLevel3[i - 1].choiceIA
                let choicePlayerOld = savePlayerChoixLevel3[i].choicePlayer
                if (choiceIAOld == 1 && choicePlayerOld == 1) choice[0]++
                else if (choiceIAOld == 1 && choicePlayerOld == 2) choice[1]++
                else if (choiceIAOld == 1 && choicePlayerOld == 3) choice[2]++
                else if (choiceIAOld == 2 && choicePlayerOld == 1) choice[3]++
                else if (choiceIAOld == 2 && choicePlayerOld == 2) choice[4]++
                else if (choiceIAOld == 2 && choicePlayerOld == 3) choice[5]++
                else if (choiceIAOld == 3 && choicePlayerOld == 1) choice[6]++
                else if (choiceIAOld == 3 && choicePlayerOld == 2) choice[7]++
                else if (choiceIAOld == 3 && choicePlayerOld == 3) choice[8]++
            }

        }

        let choiceSum = 0
        for (i in choice) {
            choiceSum += choice[i]
        }

        let probaPierre = 0
        let probaFeuille = 0
        let probaCiseaux = 0
        for (i in choice) {
            if (i == 0 || i == 3 || i == 6) probaPierre += choice[i]
            else if (i == 1 || i == 4 || i == 7) probaFeuille += choice[i]
            else if (i == 2 || i == 5 || i == 8) probaCiseaux += choice[i]
        }

        let nbTempRandom = random(1, 1, choiceSum)
        if (nbTempRandom <= probaPierre) {
            choiceIA = 1
        } else if (nbTempRandom > probaPierre && nbTempRandom <= (probaPierre + probaFeuille)) {
            choiceIA = 2
        } else if (nbTempRandom > (probaPierre + probaFeuille)) {
            choiceIA = 3
        }

        if (!choiceIA) {
            choiceIA = random(1, 1, 3)
        }

    } else choiceIA = random(1, 1, 3)

    // Memorisation du choix de l'IA et du joueur
    savePlayerChoixLevel3.push({
        "choiceIA": choiceIA,
        "choicePlayer": choicePlayer
    })

    winner = theWinnerIs(choiceIA)
    displayChoiceIA(choiceIA)
    return winner
}

const theWinnerIs = (choiceIA) => {
    let winnerIs
    if (choicePlayer == choiceIA) winnerIs = 0
    else if (choicePlayer == 1 && choiceIA == 2) winnerIs = 1
    else if (choicePlayer == 1 && choiceIA == 3) winnerIs = 2
    else if (choicePlayer == 2 && choiceIA == 1) winnerIs = 2
    else if (choicePlayer == 2 && choiceIA == 3) winnerIs = 1
    else if (choicePlayer == 3 && choiceIA == 1) winnerIs = 1
    else if (choicePlayer == 3 && choiceIA == 2) winnerIs = 2
    // Retourne le gagnant selon les choix de chacun
    return winnerIs

}

const displayChoiceIA = (choice) => {
    switch (choice) {
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

}

const calculScore = (winner) => {
    // Calcul des scores
    let winnerText = ""
    switch (winner) {
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
    document.querySelector(".choiceIA").innerHTML = ""
    document.querySelector(".choicePlayer").innerHTML = ""
    document.querySelector(".nbTour").innerHTML = "Tour de Jeu : " + (nbJeux + 1)
}

// Remise à zéro des données
const changeLevel = (e) => {
    savePlayerChoix = []
    savePlayerChoixLevel3 = []
    choice = [0, 0, 0]
    nbJeux = 0
    scoreIA = 0
    playerScore = 0
    updateScore()
}

document.querySelector(".changePlayerName").addEventListener("click", changeName)
document.querySelector("#playerName").addEventListener("keydown", changeName)
let myButtons = document.querySelectorAll(".button")
for (let i = 0; i < myButtons.length; ++i) {
    myButtons[i].addEventListener("click", playerChoice)
}

document.querySelector("#level").addEventListener("change", changeLevel)

let choicePlayer = 0