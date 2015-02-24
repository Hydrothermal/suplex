#!/usr/bin/env node

var colors = require("colors"),
    state = "front",
    repl = {},
    scr = {},
    counts = {},
    codestr, delim, code, wip;

process.stdin.resume();
process.stdin.setEncoding("utf8");

console.log("suplex what:");

function newWip() {
    var keys = Object.keys(repl),
        reg;

    wip = code.slice(0);

    for(var i = 0; i < wip.length; i++) {
        for(var u = 0; u < keys.length; u++) {
            if(wip[i] === keys[u]) {
                wip[i] = repl[keys[u]].bgWhite;
            }
        }
    }

    wip = wip.join(delim);
}

function padString(len, str) {
    str = str.toString();
    return new Array(Math.max(0, len - str.length + 1)).join(" ") + str;
}

scr.view = function() {
    newWip();

    console.log("→ " + "suplex ".green + codestr.red);
    console.log("→ " + "output ".green + wip.red);

    if(delim) {
        console.log("→ " + "joined ".green + wip.split(delim).join("").red);
    }
};

scr.repls = function() {
    var keys = Object.keys(repl);

    for(var i = 0; i < keys.length; i++) {
        console.log("→ " + (keys[i] + ": " + repl[keys[i]].bgWhite).red);
    }
};

scr.count = function() {
    var keys = Object.keys(counts),
        str1 = "→",
        str2 = "→",
        str3 = "→",
        count, per, longest;

    for(var i = 0; i < keys.length; i++) {
        count = counts[keys[i]][0];
        per = counts[keys[i]][1] + "%";

        longest = Math.max(keys[i].length, count.toString().length, per.toString().length);

        str1 += " " + padString(longest, keys[i]).green;
        str2 += " " + padString(longest, count).red;
        str3 += " " + padString(longest, per).red;
    }

    console.log(str1);
    console.log(str2);
    console.log(str3);
};

process.stdin.on("data", function(data) {
    data = data.slice(0, -2);

    switch(state) {
        case "front":
            codestr = data;
            console.log("» delimiter (enter for none):");
            state = "delim";
        break;

        case "delim":
            console.log("→ " + "suplex ".green + codestr.red);

            if(data === "") {
                console.log("→ " + "delimiter ".green + "none".red);
            } else {
                console.log("→ " + "delimiter ".green + data.red);
            }

            delim = data;
            code = codestr.split(delim);
            wip = codestr;

            for(var i = 0; i < code.length; i++) {
                if(counts[code[i]]) {
                    counts[code[i]][0] += 1;
                } else {
                    counts[code[i]] = [1];
                }

                counts[code[i]][1] = (100 / (code.length / counts[code[i]][0])).toFixed(2);
            }

            console.log("\n» enter command:");

            state = "command";
        break;

        case "command":
            data = data.split(" ");

            switch(data[0]) {
                case "help":
                    console.log("\nsuplex is designed to assist with visualizing substitution ciphers");
                    console.log("it is NOT an automatic solver, just an assistant for manual solving");
                    console.log("valid commands:");
                    console.log(" set <a> <b>:".green + " add a substitution from sequence <a> to sequence <b>");
                    console.log(" unset <a>:".green + " remove the substitution for sequence <a>");
                    console.log(" view:".green + " show the original input string and the current working output");
                    console.log(" subs:".green + " show the currently-added substitutions");
                    console.log(" counts:".green + " show all sequences in the original input string with their counts and percentages");
                    console.log(" input:".green + " return to the string input screen to begin a new cipher");
                    console.log(" done:".green + " complete the current cipher, displaying your work and exiting suplex");
                break;

                case "set":
                    repl[data[1]] = data[2];
                    newWip();
                    console.log("→ " + "output ".green + wip.red);

                    if(codestr.search(data[1]) === -1) {
                        console.log("→ " + "note: substitution not found in original input string (substitution still added)".yellow);
                    }
                break;

                case "unset":
                    if(repl[data[1]]) {
                        console.log("→ " + "unset ".green + (data[1] + ": " + repl[data[1]].bgWhite).red);
                    } else {
                        console.log("→ " + "that substitution is not set".yellow);
                    }
                break;

                case "view":
                    scr.view();
                break;

                case "subs":
                    scr.repls();
                break;

                case "counts":
                    scr.count();
                break;

                case "input":
                    console.log("suplex what:");
                    state = "front";
                break;

                case "done":
                    scr.view();
                    process.exit();
                break;

                default:
                    console.log("→ " + "invalid command; use 'help' to view valid commands".yellow);
                break;
            }

            if(state === "command") { console.log("\n» enter command:"); }
        break;
    }
});