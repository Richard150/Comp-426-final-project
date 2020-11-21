class GameView{
    constructor(){
        let player1 = {
            userName: "player1",
            health: 1,
            shieldReady: true,
            action: 'attack',
            target: 'player2',
            attackers: [],
            inSummary: false
        };
        let player2 = {
            userName: "player2",
            health: 3,
            shieldReady: true,
            action: 'block',
            target: '$none',
            attackers: [],
            inSummary: false
        };
        let player3 = {
            userName: "player3",
            health: 2,
            shieldReady: true,
            action: 'undecided',
            target: '$none',
            attackers: [],
            inSummary: false
        };
        let playerMe = {
            userName: "me",
            health: 2,
            shieldReady: true,
            action: 'undecided',
            target: '$none',
            attackers: [],
            inSummary: false
        };
        this.availibleActions = new Array("attack", "heal");
        // this.game = game;
        // this.playerArray = game.playerList;
        this.playerArray = new Array(player1, player2, player3, playerMe);
        // for (let i = 0; i < this.playerArray.length; i++){
        // }
        
        this.makeOthersView();
        this.makeMyPlayerView();
    }

    makeActionString(player){
        if (player.action == "repair"){
            return `${player.userName} repaired thier shield`;
        } else if (player.action == "attack"){
            return `${player.userName} attacked ${player.target}`;
        } else if (player.action == "block"){
            return `${player.userName} blocked`;
        } else if (player.action == "heal"){
            return `${player.userName} healed`;
        } else if (player.action == "counter"){
            return `${player.userName} countered attacks`;
        } else {
            return "no action yet";
        }
    }

    makeHealthBars(player){
        let health = player.health;
        if (health === 0){
            return `<div></div>`;
        } else if (health === 1){
            return `<div class="boxesDiv"><div class="box"></div></div>`;
        } else if (health === 2){
            return `<div class="boxesDiv">
                <div class="box"></div>
                <div class="box"></div>
                </div>`;
        } else {
            return `<div class="boxesDiv">
            <div class="box"></div>
            <div class="box"></div>
            <div class="box"></div>
            </div>`;
        }
    }


    makeOthersView(){
        const $root = $('#root');
        let playerPanel = $(`<div class="container">
            <div class="gridItem">
                <div id="usernameOne" class="names"><p>${this.playerArray[0].userName}</p></div>
                <div id="healthBoxOne" class="healthBox">
                    <div id="healths1" class="healths"><p>health: </p></div>
                    <div><p>shield: ${this.playerArray[0].shieldReady}</p></div>
                </div>
                <div><p>${this.makeActionString(this.playerArray[0])}</p></div>
            </div>
            <div class="gridItem">
                <div id="usernameTwo" class="names"><p>${this.playerArray[1].userName}</p></div>
                <div id="healthBoxTwo" class="healthBox">
                    <div id="healths2" class="healths" ><p>health: </p></div>
                    <div><p>shield: ${this.playerArray[1].shieldReady}</p></div>
                </div>
                <div><p>${this.makeActionString(this.playerArray[1])}</p></div>
            </div>
            <div class="gridItem">
                <div id="usernameThree" class="names"><p>${this.playerArray[2].userName}</p></div>
                <div id="healthBoxThree" class="healthBox">
                    <div id="healths3" class="healths"><p>health: </p></div>
                    <div><p>shield: ${this.playerArray[2].shieldReady}</p></div>
                </div>
                <div><p>${this.makeActionString(this.playerArray[2])}</p></div>
            </div>
        </div>`);
        $root.append(playerPanel);
        $("#healths1").append(this.makeHealthBars(this.playerArray[0]));
        $("#healths2").append(this.makeHealthBars(this.playerArray[1]));
        $("#healths3").append(this.makeHealthBars(this.playerArray[2]));
    }

   
    makeMyPlayerView(){
        const $root = $('#root');
        let playerPanel = $(`<div id="myDiv">
            <div id="chatDiv">
            <div class="chatbox"></div>
            <form class="chatform" action="">
                <input id="chatmessagefield" autocomplete="off" maxlength="240"/><button>send</button>
            </form>
            </div>
            <div id="myView">
                <div id="myStuff">
                    <div id="myPlayerPic"><p>pic goes here</p></div>
                    <div id="myHealthBox">
                        <div id="myHealth"><p>health: </p></div>
                        <div><p>shield: ${this.playerArray[3].shieldReady}</p></div>
                    </div>
                </div>
                <div id='buttonDiv'>
                    <div><p>Choose your next move</p></div>
                    <div><button type="button" id="blockButton">block</button></div>
                    <div><button type="button" id="attackButton">attack</button></div>
                    <div><button type="button" id="counterButton">counter</button></div>
                    <div><button type="button" id="healButton">heal</button></div>
                    <div><button type="button" id="repairButton">repair</button></div>
                </div>
            </div>
        </div>`);
        $root.append(playerPanel);
        //$("#myHealth").append(this.makeHealthBars(this.playerArray[3]));
        $("#blockButton").css("visibility" , "hidden");
        $("#attackButton").css("visibility" , "hidden");
        $("#counterButton").css("visibility" , "hidden");
        $("#healButton").css("visibility" , "hidden");
        $("#repairButton").css("visibility" , "hidden");

        if (this.availibleActions.includes("block")){
            $("#blockButton").css("visibility" , "visible");
        }
        if (this.availibleActions.includes("attack")){
            $("#attackButton").css("visibility" , "visible");
        }
        if (this.availibleActions.includes("counter")){
            $("#counterButton").css("visibility" , "visible");
        }
        if (this.availibleActions.includes("heal")){
            $("#healButton").css("visibility" , "visible");
        }
        if (this.availibleActions.includes("repair")){
            $("#repairButton").css("visibility" , "visible");
        }
        
        let chooseDiv = $(`<div id="chooseDiv">
            <p>Choose player to attack</p>
            <div><button type="button" id="attack1">${this.playerArray[0].userName}</button></div>
            <div><button type="button" id="attack2">${this.playerArray[1].userName}</button></div>
            <div><button type="button" id="attack3">${this.playerArray[2].userName}</button></div>
        </div>`);

        $("#attackButton").on('click', (e) => {
            this.playerArray[3].action = "attack";
            $("#buttonDiv").replaceWith(chooseDiv);
            $("#attack1").on('click', (e) => {
                this.playerArray[3].target = this.playerArray[0];
                $("#chooseDiv").replaceWith(`<p>waiting on other players</p>`);
            });
            $("#attack2").on('click', (e) => {
                this.playerArray[3].target = this.playerArray[1];
                $("#chooseDiv").replaceWith(`<p>waiting on other players</p>`);
            });
            $("#attack3").on('click', (e) => {
                this.playerArray[3].target = this.playerArray[2];
                $("#chooseDiv").replaceWith(`<p>waiting on other players</p>`);
            });
        });

        $("#blockButton").on('click', (e) => {
            this.playerArray[3].action = "block";
            $("#buttonDiv").replaceWith(`<p>waiting on other players</p>`);
        });
        $("#counterButton").on('click', (e) => {
            this.playerArray[3].action = "counter";
            $("#buttonDiv").replaceWith(`<p>waiting on other players</p>`);
        });
        $("#healButton").on('click', (e) => {
            this.playerArray[3].action = "heal";
            $("#buttonDiv").replaceWith(`<p>waiting on other players</p>`);
        });
        $("#repairButton").on('click', (e) => {
            this.playerArray[3].action = "repair";
            $("#buttonDiv").replaceWith(`<p>waiting on other players</p>`);
        });
    }

    
}
let game = new GameView();