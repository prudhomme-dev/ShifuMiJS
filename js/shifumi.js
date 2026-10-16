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

const EMOJIS = { 1: "✊", 2: "✋", 3: "✌️" }
const EMOJI_NAMES = { 1: "Pierre", 2: "Feuille", 3: "Ciseaux" }

let playerName = "Joueur"
let scoreIA = 0
let playerScore = 0

const $scoreIA = () => document.querySelector(".scoreIA")
const $scorePlayer = () => document.querySelector(".playerScore")
const $choiceIA = () => document.querySelector(".choiceIA")
const $choicePlayer = () => document.querySelector(".choicePlayer")
const $result = () => document.querySelector(".result")
const $winner = () => document.querySelector(".winner")
const $nbTour = () => document.querySelector(".nbTour")
const $vsEmoji = () => document.querySelector(".vs-emoji")
const $playerNameText = () => document.querySelector(".player-name-text")

// Init
$playerNameText().innerHTML = playerName
$scoreIA().innerHTML = scoreIA
$scorePlayer().innerHTML = playerScore

// IA learning data
let savePlayerChoix = []
let savePlayerChoixLevel3 = []
let choice = [0, 0, 0]
let nbJeux = 0
let activateCheat = 5
let choicePlayer = 0
let isRevealing = false

const changeName = (e) => {
    if (e.key == "Enter") {
        if (document.querySelector("#playerName").value != "") {
            playerName = document.querySelector("#playerName").value
            $playerNameText().innerText = playerName
            document.querySelector("#playerName").value = ""
            document.querySelector(".changeName").classList.remove("affiche")
        }
    } else if (e.type === "click") {
        document.querySelector(".changeName").classList.toggle("affiche")
    }
}

const playerChoice = (e) => {
    if (isRevealing) return
    const btn = e.currentTarget || e.target.closest(".choice-btn")
    if (!btn) return
    const val = parseInt(btn.dataset.choice)
    if (!val) return

    choicePlayer = val
    btn.classList.add("select")
    $choicePlayer().textContent = EMOJIS[choicePlayer]
    $choicePlayer().classList.remove("empty")

    let buttons = document.querySelectorAll(".choice-btn")
    for (let i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = true
        if (buttons[i] !== btn) buttons[i].classList.add("noselect")
    }

    nbJeux++
    let choiceLevel = document.querySelector("#level").value
    let game
    if (choiceLevel == 1) game = gameLevelOne()
    else if (choiceLevel == 2) game = gameLevelTwo()
    else if (choiceLevel == 3) game = gameLevelThree()
    calculScore(game)
}

const gameLevelOne = () => {
    let winner = 0
    let choiceIA = random(1, 1, 3)
    winner = theWinnerIs(choiceIA)
    revealIA(choiceIA)
    return winner
}

const gameLevelTwo = () => {
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
    revealIA(choiceIA)
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

    savePlayerChoixLevel3.push({
        "choiceIA": choiceIA,
        "choicePlayer": choicePlayer
    })

    winner = theWinnerIs(choiceIA)
    revealIA(choiceIA)
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
    return winnerIs
}

// Révélation progressive de l'IA : pense puis révèle
const revealIA = (choice) => {
    isRevealing = true
    const $vs = $vsEmoji()
    $vs.classList.add("thinking")
    $vs.textContent = "🤔"

    const iaEl = $choiceIA()
    iaEl.textContent = "⏳"
    iaEl.classList.remove("empty", "reveal")

    setTimeout(() => {
        $vs.classList.remove("thinking")
        $vs.textContent = "⚡"
        iaEl.textContent = EMOJIS[choice]
        iaEl.classList.remove("empty")
        iaEl.classList.add("reveal")
        isRevealing = false
    }, 900)
}

const calculScore = (winner) => {
    let winnerText = ""
    const res = $result()
    res.classList.remove("win", "lose", "draw")
    let incrementPlayer = false
    switch (winner) {
        case 0:
            winnerText = "🤝 Égalité — personne ne marque"
            res.classList.add("draw")
            break
        case 1:
            winnerText = "🤖 L'Ordinateur gagne un point"
            scoreIA++
            res.classList.add("lose")
            break
        case 2:
            winnerText = "🏆 " + $playerNameText().innerText + " gagne un point"
            playerScore++
            res.classList.add("win")
            incrementPlayer = true
            break
    }
    $winner().innerHTML = winnerText

    // Flash sur le score qui augmente
    setTimeout(() => {
        if (winner === 1) $scoreIA().classList.add("flash")
        if (winner === 2) $scorePlayer().classList.add("flash")
    }, 900)

    // Confettis sur gain joueur
    if (incrementPlayer && typeof window.confetti === "function") {
        setTimeout(() => {
            window.confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#00f5ff", "#b388ff", "#00ff88"]
            })
        }, 900)
    }

    setTimeout(updateScore, 2000)
}

const updateScore = () => {
    $scoreIA().innerHTML = scoreIA
    $scorePlayer().innerHTML = playerScore
    $scoreIA().classList.remove("flash")
    $scorePlayer().classList.remove("flash")

    $winner().innerHTML = "Choisissez votre coup"
    $result().classList.remove("win", "lose", "draw")

    for (let i = 0; i < myButtons.length; ++i) {
        myButtons[i].classList.remove("select")
        myButtons[i].classList.remove("noselect")
        myButtons[i].disabled = false
    }
    $choiceIA().textContent = "❔"
    $choiceIA().classList.add("empty")
    $choiceIA().classList.remove("reveal")
    $choicePlayer().textContent = "❔"
    $choicePlayer().classList.add("empty")
    $choicePlayer().classList.remove("reveal")
    $nbTour().innerHTML = "Tour " + (nbJeux + 1)
}

const changeLevel = () => {
    savePlayerChoix = []
    savePlayerChoixLevel3 = []
    choice = [0, 0, 0]
    nbJeux = 0
    scoreIA = 0
    playerScore = 0
    updateScore()
}

// Event listeners
document.querySelector(".changePlayerName").addEventListener("click", changeName)
document.querySelector("#playerName").addEventListener("keydown", changeName)

let myButtons = document.querySelectorAll(".choice-btn")
for (let i = 0; i < myButtons.length; ++i) {
    myButtons[i].addEventListener("click", playerChoice)
}

document.querySelector("#level").addEventListener("change", changeLevel)

// Raccourcis clavier 1/2/3
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return
    if (e.key === "1") myButtons[0].click()
    else if (e.key === "2") myButtons[1].click()
    else if (e.key === "3") myButtons[2].click()
})