// ==================== CONSTANTES ====================
const PIERRE = 1, FEUILLE = 2, CISEAUX = 3
const COUNTER = { [PIERRE]: FEUILLE, [FEUILLE]: CISEAUX, [CISEAUX]: PIERRE }
const EMOJIS = { [PIERRE]: "✊", [FEUILLE]: "✋", [CISEAUX]: "✌️" }
const EMOJI_NAMES = { [PIERRE]: "Pierre", [FEUILLE]: "Feuille", [CISEAUX]: "Ciseaux" }

const WINDOW_SIZE = 10
const RECENT_THRESHOLD = 5

// ==================== HELPERS ====================
const randomChoice = () => Math.floor(Math.random() * 3) + 1
const randomInRange = (n) => Math.floor(Math.random() * n) + 1

const weightedPick = (counts) => {
    const total = counts[0] + counts[1] + counts[2]
    if (total <= 0) return -1
    let r = randomInRange(total)
    for (let i = 0; i < counts.length; i++) {
        if (r <= counts[i]) return i
        r -= counts[i]
    }
    return counts.length - 1
}

const recencyWeight = (pos, length) =>
    (length >= RECENT_THRESHOLD && pos >= length - RECENT_THRESHOLD) ? 3 : 1

const emptyTransitions = () => Array.from({ length: 9 }, () => [0, 0, 0])
const emptyAntiPattern = () => [[0, 0, 0], [0, 0, 0], [0, 0, 0]]

const pushBounded = (arr, value, max = WINDOW_SIZE) => {
    arr.push(value)
    if (arr.length > max) arr.shift()
}

const rebuildMarkov2 = (history, transitions) => {
    for (let i = 0; i < 9; i++) {
        transitions[i][0] = 0
        transitions[i][1] = 0
        transitions[i][2] = 0
    }
    for (let i = 0; i < history.length - 2; i++) {
        const w = recencyWeight(i, history.length)
        const sIdx = (history[i] - 1) * 3 + (history[i + 1] - 1)
        transitions[sIdx][history[i + 2] - 1] += w
    }
}

const rebuildAntiPattern = (iaHistory, playerHistory, antiPattern) => {
    for (let i = 0; i < 3; i++) {
        antiPattern[i][0] = 0
        antiPattern[i][1] = 0
        antiPattern[i][2] = 0
    }
    const len = Math.min(iaHistory.length, playerHistory.length) - 1
    for (let t = 0; t < len; t++) {
        const w = recencyWeight(t, playerHistory.length)
        antiPattern[iaHistory[t] - 1][playerHistory[t + 1] - 1] += w
    }
}

const predictMarkov2 = (history, transitions) => {
    if (history.length < 2) return null
    const sIdx = (history[history.length - 2] - 1) * 3 + (history[history.length - 1] - 1)
    return transitions[sIdx]
}

const predictAntiPattern = (iaHistory, antiPattern) => {
    if (iaHistory.length < 1) return null
    return antiPattern[iaHistory[iaHistory.length - 1] - 1]
}

const combineDists = (dists) => {
    const result = [0, 0, 0]
    let totalWeight = 0
    for (const d of dists) {
        if (!d) continue
        const total = d[0] + d[1] + d[2]
        if (total <= 0) continue
        for (let i = 0; i < 3; i++) result[i] += d[i] / total
        totalWeight += 1
    }
    return totalWeight > 0 ? result : null
}

// ==================== ÉTAT GLOBAL ====================
let playerName = "Joueur", scoreIA = 0, playerScore = 0
let choicePlayer = 0, nbJeux = 0, isRevealing = false

let stateL2 = { history: [], transitions: emptyTransitions() }
let stateL3 = {
    history: [], iaHistory: [],
    transitions: emptyTransitions(),
    antiPattern: emptyAntiPattern()
}
let stateL4 = {
    history: [], iaHistory: [],
    transitions: emptyTransitions(),
    antiPattern: emptyAntiPattern(),
    turnCount: 0
}

const resetAllLevels = () => {
    stateL2 = { history: [], transitions: emptyTransitions() }
    stateL3 = {
        history: [], iaHistory: [],
        transitions: emptyTransitions(),
        antiPattern: emptyAntiPattern()
    }
    stateL4 = {
        history: [], iaHistory: [],
        transitions: emptyTransitions(),
        antiPattern: emptyAntiPattern(),
        turnCount: 0
    }
}

// ==================== DOM ====================
const $scoreIA = () => document.querySelector(".scoreIA")
const $scorePlayer = () => document.querySelector(".playerScore")
const $choiceIA = () => document.querySelector(".choiceIA")
const $choicePlayer = () => document.querySelector(".choicePlayer")
const $result = () => document.querySelector(".result")
const $winner = () => document.querySelector(".winner")
const $nbTour = () => document.querySelector(".nbTour")
const $vsEmoji = () => document.querySelector(".vs-emoji")
const $playerNameText = () => document.querySelector(".player-name-text")

$playerNameText().innerHTML = playerName
$scoreIA().innerHTML = scoreIA
$scorePlayer().innerHTML = playerScore

// ==================== GESTION NOM ====================
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

// ==================== TOUR DU JOUEUR ====================
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

    const buttons = document.querySelectorAll(".choice-btn")
    for (let i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = true
        if (buttons[i] !== btn) buttons[i].classList.add("noselect")
    }

    nbJeux++
    const choiceLevel = document.querySelector("#level").value
    let game
    if (choiceLevel == 1) game = gameLevelOne()
    else if (choiceLevel == 2) game = gameLevelTwo()
    else if (choiceLevel == 3) game = gameLevelThree()
    else if (choiceLevel == 4) game = gameLevelFour()
    calculScore(game)
}

// ==================== NIVEAUX ====================
const gameLevelOne = () => {
    const choiceIA = randomChoice()
    const winner = theWinnerIs(choiceIA)
    revealIA(choiceIA)
    return winner
}

const gameLevelTwo = () => {
    const s = stateL2
    let choiceIA = randomChoice()
    const dist = predictMarkov2(s.history, s.transitions)
    if (dist) {
        const idx = weightedPick(dist)
        if (idx >= 0) choiceIA = COUNTER[idx + 1]
    }
    pushBounded(s.history, choicePlayer)
    rebuildMarkov2(s.history, s.transitions)
    const winner = theWinnerIs(choiceIA)
    revealIA(choiceIA)
    return winner
}

const gameLevelThree = () => {
    const s = stateL3
    rebuildMarkov2(s.history, s.transitions)
    rebuildAntiPattern(s.iaHistory, s.history, s.antiPattern)

    const combined = combineDists([
        predictMarkov2(s.history, s.transitions),
        predictAntiPattern(s.iaHistory, s.antiPattern)
    ])

    let choiceIA = randomChoice()
    if (combined) {
        const idx = weightedPick(combined)
        if (idx >= 0) choiceIA = COUNTER[idx + 1]
    }

    pushBounded(s.history, choicePlayer)
    pushBounded(s.iaHistory, choiceIA)

    const winner = theWinnerIs(choiceIA)
    revealIA(choiceIA)
    return winner
}

const gameLevelFour = () => {
    const s = stateL4
    rebuildMarkov2(s.history, s.transitions)
    rebuildAntiPattern(s.iaHistory, s.history, s.antiPattern)

    const combined = combineDists([
        predictMarkov2(s.history, s.transitions),
        predictAntiPattern(s.iaHistory, s.antiPattern)
    ])

    let choiceIA = randomChoice()
    let predicted = 0
    if (combined) {
        const idx = weightedPick(combined)
        if (idx >= 0) {
            predicted = idx + 1
            choiceIA = COUNTER[predicted]
        }
    }

    s.turnCount = (s.turnCount || 0) + 1
    if (s.turnCount % 7 === 0 && predicted > 0) {
        let bluff
        do { bluff = randomChoice() } while (bluff === choiceIA)
        choiceIA = bluff
    }

    pushBounded(s.history, choicePlayer)
    pushBounded(s.iaHistory, choiceIA)

    const winner = theWinnerIs(choiceIA)
    revealIA(choiceIA)
    return winner
}

// ==================== ARBITRAGE ====================
const theWinnerIs = (choiceIA) => {
    if (choicePlayer == choiceIA) return 0
    if (choicePlayer == PIERRE && choiceIA == FEUILLE) return 1
    if (choicePlayer == PIERRE && choiceIA == CISEAUX) return 2
    if (choicePlayer == FEUILLE && choiceIA == PIERRE) return 2
    if (choicePlayer == FEUILLE && choiceIA == CISEAUX) return 1
    if (choicePlayer == CISEAUX && choiceIA == PIERRE) return 1
    if (choicePlayer == CISEAUX && choiceIA == FEUILLE) return 2
    return 0
}

// ==================== ANIMATION RÉVÉLATION ====================
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

// ==================== SCORE / FEEDBACK ====================
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

    setTimeout(() => {
        if (winner === 1) $scoreIA().classList.add("flash")
        if (winner === 2) $scorePlayer().classList.add("flash")
    }, 900)

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

// ==================== CHANGEMENT DE NIVEAU ====================
const changeLevel = () => {
    resetAllLevels()
    nbJeux = 0
    scoreIA = 0
    playerScore = 0
    updateScore()
}

// ==================== EVENT LISTENERS ====================
document.querySelector(".changePlayerName").addEventListener("click", changeName)
document.querySelector("#playerName").addEventListener("keydown", changeName)

let myButtons = document.querySelectorAll(".choice-btn")
for (let i = 0; i < myButtons.length; ++i) {
    myButtons[i].addEventListener("click", playerChoice)
}

document.querySelector("#level").addEventListener("change", changeLevel)

document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return
    if (e.key === "1") myButtons[0].click()
    else if (e.key === "2") myButtons[1].click()
    else if (e.key === "3") myButtons[2].click()
})