class Board {

    _$pool
    _$poolFace
    _$decks

    constructor(boardQuery) {
        const $board = document.querySelector(boardQuery);
        this._$pool = $board.querySelector('#pool');
        this._$poolFace = $board.querySelector('#pool-face');
        const $piles = Array.from($board.querySelectorAll('.pile'));
        // console.log($piles);
        this._$decks = Array.from($board.querySelectorAll('#decks .deck'));
        this._$score = $board.querySelector('#scoreValue');
        this._score = 0;

        $piles.map($p => {
            $p.ondragover = (ev) => ev.preventDefault();
            $p.ondrop = (ev) => {
                ev.preventDefault();
                const cardId = ev.dataTransfer.getData('cardId');
                const $card = document.getElementById(cardId);
                const $sourceDeck = $card.parentElement;
                if (!$p.children.length) {
                    if (+$card.dataset.number !== 1) {
                        return;
                    }
                } else if (+$p.lastChild.dataset.number !== +$card.dataset.number - 1) {
                    return;
                }
                $p.appendChild($card);
                if ($sourceDeck.lastChild) {
                    $sourceDeck.lastChild.classList.remove('back');
                }
                
                // Adiciona pontos ao mover uma carta
                this._score += 5;
                this._updateScore();
            };
        });

        this._$decks.map($d => {
            $d.ondragover = (ev) => ev.preventDefault();
            $d.ondrop = (ev) => {
                ev.preventDefault();
                const $targetCard = $d.lastChild;
                const cardId = ev.dataTransfer.getData('cardId');
                const $card = document.getElementById(cardId);
                const $sourceDeck = $card.parentElement;
                if ($targetCard) {
                    const targetIsBlack = $targetCard.classList.contains('clubs') || $targetCard.classList.contains('spades');
                    const sourceIsBlack = $card.classList.contains('clubs') || $card.classList.contains('spades');
                    if (targetIsBlack === sourceIsBlack) { return; }
                    if (+$targetCard.dataset.number !== +$card.dataset.number + 1) { return; }
                }
                const $siblings = Array.from($card.parentElement.children);
                $siblings.slice($siblings.indexOf($card)).map($s => $d.appendChild($s));
                if ($sourceDeck.lastChild) {
                    $sourceDeck.lastChild.classList.remove('back');
                }
                
                // Adiciona pontos ao mover um conjunto de cartas
                this._score += 10;
                this._updateScore();
            };
        });

        // Seleciona o botão de reset
        const $resetButton = document.getElementById('resetButton');

        // Adiciona um ouvinte de evento para o clique no botão
        $resetButton.addEventListener('click', () => {
            this._resetPool();
        });

        let cards = this._shuffle(this._buildCards());
        this._initGame(cards);
        
    }


    _resetPool() {
        if(confirm("Você perdera 10 pontos.\nContinuar?")){
            // Pega todas as cartas da face e da pool
            const $faceCards = Array.from(this._$poolFace.children);
            const $poolCards = Array.from(this._$pool.children);

            // Adiciona as cartas de volta à pool
            $faceCards.forEach($card => this._$pool.appendChild($card));
            $poolCards.forEach($card => this._$pool.appendChild($card));
            
            // Subtrai pontos ao resetar a pool
            this._score -= 10;
            this._updateScore();
        }
    }
    /**
     * @returns {Card[]}
     */
    _buildCards() {
        let cards = [];
        Object.keys(Suit).map(suit => {
            for (let i = 1; i <= 13; i++) {
                let c = new Card(i, suit);
                c.$card.onclick = (ev) => {
                    const $card = ev.target.closest('.card');
                    const $parent = $card.parentElement;
                    if ($parent.id === 'pool') {
                        $parent.removeChild($card);
                        this._$poolFace.appendChild($card);
                    }
                };
                cards.push(c);
            }
        });
        return cards;
    }

    /**
     *
     *
     * @param {Card[]} cards
     * @returns {Card[]}
     * @memberof Board
     */
    _shuffle(cards) {
        var copy = [], n = cards.length, i;
        while (n) {
            i = Math.floor(Math.random() * n--);  
            copy.push(cards.splice(i, 1)[0]);
        }
        return copy;
    }

    _initGame(cards) {

        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < i; j++) {
                const c = cards.pop();
                c.turn();
                this._$decks[i].appendChild(c.$card);
            }
            this._$decks[i].appendChild(cards.pop().$card);
        }

        // for (let i = 0; i < 12; i++) {
        //     let position = Math.floor(Math.random() * cards.length);
        //     this._$decks[position % 7].appendChild(cards.pop().$card);
        // }
        cards.map(c => this._$pool.appendChild(c.$card));

        
        // Atualize a pontuação ao iniciar o jogo
        this._updateScore();
    }

    _updateScore() {
        // Atualiza o elemento HTML de pontuação
        this._$score.textContent = this._score;
    }
}