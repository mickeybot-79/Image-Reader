const express = require('express')
const app = express()
const { pdfToPng } = require('pdf-to-png-converter')
const Tesseract = require('tesseract.js')
const PORT = process.env.PORT || 3500

app.use(express.static(__dirname + '/public'))

app.use(express.json({limit: "50mb", extended: true}))
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))

app.post('/member', (req, res) => {
    const { content } = req.body
    const testFunc = async () => {
        let result = []
        let numberOfPages = 0
        const pngPages = await pdfToPng(Buffer.from(content, 'base64'), {
            disableFontFace: false,
            useSystemFonts: false,
            enableXfa: false,
            viewportScale: 2.0,
            outputFileMaskFunc: (pageNumber) => `page_${pageNumber}.png`,
            strictPagesToProcess: false,
            verbosityLevel: 0,
        })

        numberOfPages = pngPages.length

        for (let i = 0; i < pngPages.length; i++) {

            await Tesseract.recognize(
                pngPages[i].content,
                'eng',
            )
                .then(({ data: { text } }) => {
                    result.push(text)
                    if (result.length === numberOfPages) {
                        const wholeString = result.toString()
                        res.send(wholeString)
                    }
                })
                .catch(err => {
                    console.error('Error during OCR:', err)
                    res.send(err)
                })
        }
    }

    testFunc()

})

app.post('/text', (req, res) => {
    const { text } = req.body
    if (text.search("UnitedHealthcare") !== -1) {
        if (text.search("we've approved the service") !== -1) {
            const startIndex = text.indexOf("Member name:")
            const nextLineBreak = text.indexOf("\n", startIndex)
            const memberName = text.substring(startIndex + 13, nextLineBreak)
            console.log('UnitedHealthcare member name:', memberName)
            res.send(memberName)
        } else {
            res.send('not auth')
        }
    } else if (text.search("Health and Human") !== -1) {
        if (text.search("AUTHORIZATION FOR COMMUNITY CARE SERVICES") !== -1) {
            const startIndex = text.indexOf("7. ")
            const nextLineBreak = text.indexOf("\n", startIndex)
            const nextSpace = text.indexOf(" ", nextLineBreak)
            const nextSpace2 = text.indexOf(" ", nextSpace + 1)
            const memberName = text.substring(nextLineBreak + 1, nextSpace2)
            console.log('HHSC member name:', memberName)
            res.send(memberName)
        } else {
            res.send('not auth')
        }
    } else if (text.search("Aetna") !== -1) {
        if (text.search("SERVICE AUTHORIZATION") !== -1) {
            const startIndex = text.indexOf("Member Name:")
            const nextLineBreak = text.indexOf("\n", startIndex)
            const memberName = text.substring(startIndex + 13, nextLineBreak)
            console.log('Aetna member name:', memberName)
            res.send(memberName)
        } else {
            res.send('not auth')
        }
    } else if (text.search("Molina Healthcare") !== -1) {
        if (text.search("Authorization Approval Letter") !== -1 || text.search("Authorization Notification") !== -1) {
            const startIndex = text.indexOf("Member Name:")
            const nextLineBreak = text.indexOf("\n", startIndex)
            const memberName = text.substring(startIndex + 13, nextLineBreak)
            if (memberName.search("Requesting Provider") !== -1) {
                const correctMemberName = memberName.substring(0, memberName.search("Requesting Provider"))
                console.log('Molina member name:', correctMemberName)
                res.send(correctMemberName)
            } else {
                console.log('Molina member name:', memberName)
                res.send(memberName)
            }
        } else {
            res.send('not auth')
        }
    } else if (text.search("Superior Health Plan") !== -1) {
        if (text.search("Notification of Authorization") !== -1) {
            const startIndex = text.indexOf("Member Name:")
            const nextLineBreak = text.indexOf("\n", startIndex)
            const memberName = text.substring(startIndex + 13, nextLineBreak)
            console.log('Superior member name:', memberName)
            res.send(memberName)
        } else {
            res.send('not auth')
        }
    } else if (text.search("Cook Childrens") !== -1) {
        if (text.search("Authorization approval letters were sent") !== -1) {
            const startIndex = text.indexOf("Case Name")
            const nextLineBreak = text.indexOf("\n", startIndex)
            const nextSpace = text.indexOf(" ", nextLineBreak)
            const nextSpace2 = text.indexOf(" ", nextSpace + 1)
            const memberName = text.substring(nextLineBreak + 1, nextSpace2)
            console.log('Cook member name:', memberName)
            res.send(memberName)
        } else {
            res.send('not auth')
        }
    } else {
        console.log('no insurance found')
        res.send('no insurance found')
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))