# CTFd-Challenge-Discovery-Plugin
### V2.0.1 BETA
This is a CTFd platform plugin that allows for Challenge Discovery.

# Challenge Discovery
This will allow for certain problems to show up only after a predefined set of problems have been solved.

*DISCLAIMER* This plugin is currently in development, but works. It is just a bit of a duct-tape User Interface right now

# Usage:
There are two different functions this plugin has: Adding challenge-discovery information to a given challenge, and Deleting challenge-dsicvoery information from a given challenge.

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
