// if (cache.indexOf(submission.id) >= 0){
//     console.log(`🙈 We've seen ${submission.id} already.`);
// } else {
//     cache.push(submission.id); 
//     submission.comments.fetchAll().then(comments => {
//         console.log(`👀 We haven't seen ${submission.id} before...`)
//         //If no comments contain !wave...
//         if(!comments.some(comment => comment.body.includes('!wave'))){
//             //console.log(`  ✅ Adding !wave... ${submission.id} — ${submission.title}`); 
//             //r.getSubmission(submission.id).reply('!wave');

//     });
// }





// let surfWaves = async () => {
//     console.log('Surfing....'); 
//     await r.getSubreddit('vexillologycirclejerk').getNew()
//         .then(subListing => {
//             //Get the first ten submissions...
//             subListing.slice(0,10).forEach(submission => {
//                 if (cache.indexOf(submission.id) >= 0){
//                     console.log(`🙈 We've seen ${submission.id} already.`)
//                 } else {
                    
//                     cache.push(submission.id); 
//                     submission.comments.fetchAll().then(comments => {
//                         console.log(`👀 We haven't seen ${submission.id} before...`)
//                         //If no comments contain !wave...
//                         if(!comments.some(comment => comment.body.includes('!wave'))){
//                             console.log(`  ✅ Adding !wave... ${submission.id} — ${submission.title}`); 
//                             r.getSubmission(submission.id).reply('!wave');
//                         } else {
//                             console.log(`  ⛔️ No need, someone got here first. (${submission.id})`)
//                         }
//                     });
//                 }
//             }); 
//         }).then(r => {console.log('test2')}); 
// }


// let surfWaves = async () => {
//     console.log('Surfing....'); 
//     let subListing = await r.getSubreddit('vexillologycirclejerk').getNew(); 

//     //Get the first ten submissions and decide which ones to look at...
//     let candidates = subListing.slice(0,10).filter(submission => {
//         if (cache.indexOf(submission.id) >= 0){
//             console.log(`🙈 We've seen ${submission.id} already.`)
//             return false; 
//         } else {
//             console.log(`👀 We haven't seen ${submission.id} before...`)
//             return true; 
//         }
//     }); 

    
//     // Lets grab the comments..
//     let fullSubmissions =  Promise.all(candidates.map(submission => 
//         submission.comments.fetchAll()
//     )); 

//     console.log(fullSubmissions); 


//     let makeRequests = await fullSubmissions
//         .filter(submission => (!submission.comments.some(comment => comment.body.includes('!wave'))))
//         .map(r.getSubmission(submission.id).reply('!wave')); 
//     return Promise.all(makeRequests);
// }