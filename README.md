# CTFd-Challenge-Discovery-Plugin
This is a CTFd platform plugin that allows for Challenge Discovery.

# Challenge Discovery
This will allow for certain problems to show up only after a predefined set of problems have been solved.

*DISCLAIMER* This plugin still needs to have an overhaul in the Admin's GUI section. And there also needs to be a more automated way of doing things.

# Usage:
There are two different functions this plugin has: Adding challenge-discovery information to a given challenge, and Deleting challenge-dsicvoery information from a given challenge.

## Adding discovery:
1. Open up the Admin's challenge page and create any problem you wish.
1. Open up a created problem and click on "Discovery" on the bottom right of the Challenge viewport.
1. Click "New Discovery".
1. Click on the dropdown menu that pops up.
1. Click the problems you want the user to solve in order to see the particular problem you click from step 2.
    * All of the problems you selected will have to be solved by the users before they can view your problem
1. If you want to add another discovery set, click "New Discovery". Keep doing so until you are satisfied.
    * This will create a butch of ANDed problems that need to be solved that will be ORed together.
        * Only one of the "Discovery" lists will need to be true for a user to see the problem.
1. When you are done, click Update and Update.

*Note:* a problem is defaulted to showing up for everyone if no discovery list is given. If you want a problem to be hidden for everyone no matter what, I would suggest clicking on the "Hidden" checkbox that is built into the CTFd platform.

## Deleting discovery:
### Before hitting update:
Simply click on red "Remove" button next to the particular "Discovery" set you wish to delete.

### After htting update:
Note: You will see a series of numbers with "|" inbetween in blue boxes them near the bottom of the viewport. The numbers are the Challenge ID numbers. If you don't happen to know the challenge ID numbers for your problems, simply create a new "Discovery" set and the challenge ID will be the number to the left of the name of each of the problems in the dropdown list.

Simply click on the righthand side of the blue box that contains the challenge IDs that you wish to delete, and click update and update.

## Plugin:
1. Copy discovery directory into to the plugins directory of CTFd
1. Add the lines of the files in this repository into the respected files in your CTFd repository.
