# CTFd-Challenge-Discovery-Plugin
### V2.0.2 BETA
This is a CTFd platform plugin that allows for Challenge Discovery.

# Challenge Discovery
This will allow for certain problems to show up only after a predefined set of problems have been solved.

Specifically, this plugin allows for an arbitrarily large number of 'ORed' sets of dependent problems before a problem is shown. This means that the problem will be shown when any predefined list of problems is solved by the viewing user.

### Example
The Dev Team has made Problem A be shown if either (Problem B AND Problem C) or if (Problem D) is solved. This means that a competitor will only need to solve either (B and C) or D for Problem A to be visible to them.


### *DISCLAIMER*
This plugin is currently in development, but works. It is just a bit of a duct-tape User Interface right now

# Usage:
There are two different functions this plugin has: Adding challenge-discovery information to a given challenge, and Deleting challenge-dsicvoery information from a given challenge.

# ADDING AUTO-LOAD CHALLENGES AFTER SOLVING CHALLENGE FEATURE
Correctly, the default theme does not support Challenge Discovery completely. When a user submits a correct answer, the challenges displayed aren't updated until they refresh.

To correct this, all that has to be down is to add:
`update();`

at the end of the submitkey(chal, key, nonce) function of the chalboard.js in the theme folder that your CTFd instance is using. Specifically, for CTFd 1.0.5, this file is found in CTFd\themes\original\static\js\chalboard.js. Specifically, in CTFd 1.0.5, this line of code can be placed on line 125 of the chalboard.js file. Below I have an example of how the "update();" line could be put in:


```
else if (result.status == 1){ // Challenge Solved
            result_notification.addClass('alert alert-success alert-dismissable text-center');
            result_notification.slideDown();

            $('.chal-solves').text((parseInt($('.chal-solves').text().split(" ")[0]) + 1 +  " Solves") );

            answer_input.val("");update()
            answer_input.removeClass("wrong");
            answer_input.addClass("correct");
            
            update(); //For Auto-Loading Challenges
}
```


# Installing
Simply copy the files in this repo into an existing [CTFd 1.0.5](https://github.com/CTFd/CTFd/releases/tag/1.0.5) CTF workspace. You will most likely need to delete the CTFd\ctfd.db file in your instance and restart the CTFd service.

## Adding discovery to a challenge:
1. Open up the Admin's challenge page and create any problem you wish.
1. Open the plugin tab called "Discovery". Open up a created problem. (For right now this page looks the same as the Admin's Challenge Page)
1. Click on "New Discovery" and Click on the dropdown menu that pops up.
1. Click the problems you want the user to solve in order to see the particular problem you click from step 2.
    * All of the problems you selected will have to be solved by the users before they can view your problem
1. If you want to add another discovery set, click "New Discovery". Keep doing so until you are satisfied.
    * This will create a butch of ANDed problems that need to be solved that will be ORed together.
        * Only one of the "Discovery" lists will need to be true for a user to see the problem.
1. When you are done, click Update.

*NOTE:* You may need to click on "Update" when you first open a problem. I'll try to correct the problem in later versions, but for now it's just a duct-tape correction in javascript

*Note:* a problem is defaulted to showing up for everyone if no discovery list is given. If you want a problem to be hidden for everyone no matter what, I would suggest clicking on the "Hidden" checkbox that is built into the CTFd platform.

## Deleting discovery:
### Before hitting update:
Simply click on red "Remove" button next to the particular "Discovery" set you wish to delete.

### After htting update:
Note: You will see a series of numbers with "|" inbetween in blue boxes them near the bottom of the viewport. The numbers are the Challenge ID numbers. If you don't happen to know the challenge ID numbers for your problems, simply create a new "Discovery" set and the challenge ID will be the number to the left of the name of each of the problems in the dropdown list.

Simply click on the righthand side of the blue box that contains the challenge IDs that you wish to delete, and click update. (NOTE: there is an invisible "x" that you can't see...This is called a feature not a bug. I totally wanted that to happen.)
