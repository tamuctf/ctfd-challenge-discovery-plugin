# CTFd-Challenge-Discovery-Plugin
### V2.0.3 BETA
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

# Terminology
**Challenge Discovery** - The process of having challenges depend on other challenges before being visible to the competitor/user
**Discovery Set** - The set of challenges a competitor/user needs to solve before a particular challenge is able to be seen.
**Discovery List** - The set of Discovery Sets for a particular challenge. (If it shows up)


## Adding discovery to a challenge:
1. Open up the Admin's challenge page and create any problem you wish.
1. Open the plugin tab called "Discovery". Open up a created problem.
1. Click on the dropdown menu that appears to the right of the challenge's name that you wish to add a Discovery Set to.
1. Click the problems you want to make up a Discovery Set for the Challenge in set 3.
  * **NOTE:** there can be multiple Discovery Sets. When any of the Challenge's Discovery Sets have been satisified, the challenge becomes visible
1. When you are done, click Update. This refreshes the page, so you can add another Discovery Set using these 5 steps.

*Note:* A challenge is defaulted to showing up for everyone if no discovery set is given. If you want a problem to be hidden for everyone no matter what, I would suggest clicking on the "Hidden" checkbox that is built into the CTFd platform.

## Deleting Discovery Set:
Simply click on the light blue / gray "x" that is below the last challenge in the Discovery Set. 

## Features
### Auto-Discovery
This feature automatically adds a set of preconfigured Discovery Sets to each challenge.

The settings for this will unlock a challenge if:
  * If it is the first challenge in a catagory
  * If the next lowest challenge in the catagory has been solved
  * If the next two lowest challenges in the catagory have been solved and a challenge of greater value in a different catagory have been solved.

**NOTE:** The Discovery Sets created from this feature cannot be easily deleted without deleting all manually-created Discovery Sets with them.

### Delete All
This feature will delete all stored data.

### ON/OFF
This feature will turn off or on Challenge Discovery for the entire CTFd instance. This is usefull for a quick unlocking of all challenges without permanently deleting all of the Discovery Sets.

The ON/OFF feature is the toggle at the very top of the page right below "Challenge Discovery" in the center of the page. When the white circle is on the right, Challenge Discovery is turned on, otherwise it is turned off.

### Preview
This feature simulates which challenge would be visible to users/competitors after solving a certain set of challenges.

To use the feature:
1. Click on the dropdown menu at the top under the word "Preview"
1. Select the list of challenges you want to simulate as being "solved"
1. Click on the "Preview" button at near top of the page

Colors:
  * Challenge Thumbnail:
    * **Green:** The challenge is visible to the user/competitor who has solved the list of "solved" challenges. (This one hasn't been solved though)
    * **Red:** The challenge is not visible to the user/competitor and it has not been solved.
    * **Blue:** The challenge is visible, because the user/compeitor has solved this challenge. Because you can "solve" any problem (regardless of if would be visible or not), the particular set of "solved" problems may be impossible for a compeitor/user to get without the help of an admin.
  * Challenges in each Discovery Set:
    * **Green:** The challenge has been solved
    * **red:** The challenge has not been solved
  * Discovery Set:
    * **Green:** All challenges in the Discovery Set have been solved, and therefore the challenge would be visible. (Only one of a challenge's Discovery Set has to be green for the challenge to become visible)
    * **red:** Not all of the challenges in the Discovery Set have been solved.
