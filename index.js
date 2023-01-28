'use strict';
const snoowrap = require('snoowrap');
const colors = require('colors');
const dotenv = require('dotenv').config();
const {table} = require('table');

 
console.log(`Logging in as ${process.env.USERNAME}...`);
  
const r = new snoowrap({
  userAgent: process.env.USERAGENT,
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

const settings = {
    subreddit: 'electricvehicles',
    time: 'year',
    numPosts: 300,
    numUsers: 100
}
const criteria = {
    minAge: (365*2),
    minCommentKarma: 5000,
    minKarma: 1000, //TODO
    isMod: false //TODO
};

let users = {
};

//Takes a comment object and returns an array of all comments within it, recursively iterating through replies
let flattenCommentChain = obj => {
    let flatArr = [];
    flatArr.push({
        'author':  {name: obj.author?.name},
        'body': obj.body,
        'score': obj.score
    });
    if (obj['replies'] && Array.isArray(obj['replies'])) {
        obj.replies.forEach(e =>{
            flatArr = flatArr.concat(flattenCommentChain(e));
        });
    }
    return flatArr;
}

let surfWaves = async () => {

    //Retrieve the latest X  subreddit submissions
    console.log('Grabbing the last 300 submissions....'); 
    
    let submissions = await r.getSubreddit(settings.subreddit).getNew({time: settings.time});
    submissions = await submissions.fetchMore({amount: 100, append: true});
    submissions = await submissions.fetchMore({amount: 100, append: true});
    submissions = submissions.slice(0,settings.numPosts);
    
    console.log("Got submissions: " + submissions.length + " posts."); 
    submissions.slice(0,20).forEach((submission, i) => {
        console.log(`    ${i+1}: ${submission.title.slice(0,20)} (${submission.id})...`); 
    })


    //Iterate through each submission, grab all comments, and count the number of comments per user
    console.log("Grabbing comments...");
    for (const submission of submissions) {
        let comments = await r.getSubmission(submission.id).comments.fetchAll(); 

        let flatComments = [];
        comments.forEach(c => {
            flatComments = flatComments.concat(flattenCommentChain(c))
        });
        
        console.log(`${submission.title.slice(0,15)}...: ${flatComments.length} comments`);

        //Add comment totals to each user
        flatComments.forEach(comment => {
            if (users[comment.author.name] === undefined){
                users[comment.author.name] = 1; 
            } else {
                users[comment.author.name]++; 
            }
        });
    }

    //Get users as Array. 
    let usersAsArray = Object.keys(users).map(key => {
        return {
            'username': key, 
            'numComments': users[key]
        } ;
    });

    console.log(usersAsArray.length + " unique users found.");
    usersAsArray = usersAsArray
        .filter(u => u['username']!=="[deleted]")
        .filter(u => u['username']!=="EVinthewoods")
        .sort((first, second) => second['numComments'] - first['numComments'])
        .slice(0,settings.numUsers);
    console.log(usersAsArray.length + " unique users after filtering.");


    for (let [index, user] of usersAsArray.entries()) {
        let userInfo = await r.getUser(user['username']).fetch();
        usersAsArray[index] = {
            ...user,
            dateCreated: userInfo.created_utc, 
            linkKarma: userInfo.link_karma, 
            commentKarma: userInfo.comment_karma, 
            isMod: userInfo.is_mod
        }
    }; 
    console.log("Users as array:"); 
    console.log (usersAsArray)

    //Apply filters
    let maxAccountCreatedDate = Date.now()- (criteria.minAge*24*60*60*1000);
    console.log(`➡️ Excluding accounts newer than ${new Date(maxAccountCreatedDate).toDateString()}`);
    console.log(`➡️ Excluding [deleted] accounts`);
    console.log(`➡️ Excluding accounts with less than ${criteria.minCommentKarma} comment karma`);
    console.log(`➡️ Excluding moderators`);

    let topUsers = usersAsArray
        .sort((first, second) => second['numComments'] - first['numComments'])
        .filter(u => u['username']!=="[deleted]")
        .filter(u=> u['commentKarma'] > criteria.minKarma)
        .filter(u => u['dateCreated'] < maxAccountCreatedDate)
        .slice(0,settings.numUsers);

    ///Human-readable formatting. 
    topUsers.forEach(user => {
        //Convert UTC to DDMMYYYY
        let date = new Date(user['dateCreated']*1000);
        user['joinDate'] = (date.toDateString()); 
    }); 

    //console.log(table(topUsers.map(u=> Object.values(u))));
    console.table(topUsers.map(u =>{
            return {
                'username': u['username'],
                'numComments': u['numComments'].toLocaleString(),
                'commentKarma': u['commentKarma'].toLocaleString(),
                'joinDate': u['joinDate'],
                'isMod': u['isMod']?"✅":"❌"
            }
        }),
        ['username', 'numComments', 'commentKarma', 'joinDate']
    );

    console.log('Finished.'); 

}

surfWaves();