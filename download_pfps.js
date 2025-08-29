import { fetch, write, stat } from 'bun';
import { promises as fs } from 'fs'; // Use the promises version for async/await
import path from 'path';

// The folder where the images will be saved.
const outputFolder = 'images';

// Array of image URLs to download.
const imageUrls = [
    "https://pbs.twimg.com/profile_images/1955870561915064322/s7Hxnh0A_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1f8.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1e6.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1ef-1f1f5.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1e8-1f1f3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1f5-1f1f8.svg",
    "https://pbs.twimg.com/profile_images/1958251906741993473/miw0SF4h_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f5fa.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f54a.svg",
    "https://pbs.twimg.com/profile_images/1887956079474069504/zfhjJrN1_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1695264970064396288/Ycu2k1wS_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f3b8.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1f2.svg",
    "https://pbs.twimg.com/profile_images/1787641253401907200/pHAejfAC_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1961113900126236672/ZWs0lIrb_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1fab2.svg",
    "https://pbs.twimg.com/profile_images/1674593632978968578/lI0b6TIU_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f3f4-200d-2620-fe0f.svg",
    "https://pbs.twimg.com/profile_images/1589396453331537922/qP1qN3HW_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f970.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/2600.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f408.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f606.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f495.svg",
    "https://pbs.twimg.com/profile_images/1945997753382846464/y4to-Kms_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1916198224513404928/iKFEr7kv_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1860142943044075520/rU7cHpW8_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1664672475030880259/ouO6TIb6_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1931395656754548736/PD9BHETc_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1871091932526694401/UPFj-fhz_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1905493813730144256/bPR3nfsG_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1642346831622598661/r1zvQN-G_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1957603707840790533/LF7ebxa7_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1648483418542571523/lI0KGqkA_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1706061326865309696/NYBx3sFc_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1421075687306268674/ZM8RWWXu_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1948440820287422464/RPk3q3c2_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1947929999824080896/8lbbHUuR_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1922745257914945537/exqNjNlI_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1873735596268773377/VNfyrplI_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1910749102406856704/pn9RLeI7_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1655621644293926913/ST_ZvanT_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1948516531807170560/1_PYc6qL_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f984.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f596.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f49b.svg",
    "https://pbs.twimg.com/profile_images/1946604630152224768/Zt1Rad7o_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f333.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f333.svg",
    "https://pbs.twimg.com/profile_images/1633789521367035907/54Vpjz48_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1760736343578091520/FcLzHVrb_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f601.svg",
    "https://pbs.twimg.com/profile_images/1927765616741720064/Fq7tZm08_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/2728.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1fae7.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4bb.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f54a.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1fabd.svg",
    "https://pbs.twimg.com/profile_images/1700137872236347392/Sp8cqLdT_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1901480845585596416/B5g0FEPx_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1502411346817785857/5Ihzi8oA_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1945927395443109888/JqnAzx4I_normal.jpg",
    "https://pbs.twimg.com/profile_images/1945927395443109888/JqnAzx4I_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1618814384792543232/SFymiMDK_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1512490077833900045/hiUiXrAq_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1904893649709576192/UdxwD_pe_normal.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f336.svg",
    "https://pbs.twimg.com/profile_images/1904893649709576192/UdxwD_pe_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1873741638972899328/fhXbXjSb_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1796742055906914305/iaLWQyB6_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1141781661551665153/BMnvVd2u_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1694331764091564032/My5iC3pg_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1848143587835265024/bhuhxq3o_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1955870561915064322/s7Hxnh0A_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1f8.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1e6.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1ef-1f1f5.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1e8-1f1f3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1f5-1f1f8.svg",
    "https://pbs.twimg.com/profile_images/1758208759858384896/35NAkzuK_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1946720488371236865/FjxpDSsQ_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1876040683691372544/BQ1aXC8s_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1875833595778027520/9lejI-bV_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1f8.svg",
    "https://pbs.twimg.com/profile_images/1875201022806609920/D-1uten9_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1702056331400667136/_zTafmTK_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1875721197771460608/9IcQ3GhB_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1947757145753325568/k9M9FlLT_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1922172350574772224/i4spcOOJ_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1947516543916773377/qwIU8ZUA_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1874907990408798208/zyOQPBkb_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1774193897909923841/pFnMyW5V_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1874969055670501376/wfhN5EYa_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1f8.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f407.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f3d4.svg",
    "https://pbs.twimg.com/profile_images/1960189397975883776/asPMqc6q_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1958436801397624832/vOrnfAx1_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f3a8.svg",
    "https://pbs.twimg.com/profile_images/1863007424086429696/qwlLNXQX_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1618328859413286913/w5vsLU4e_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/26d3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/26d3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/26d3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f41c.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/26d3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4a5.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/26d3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4a5.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/26d3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4a5.svg",
    "https://pbs.twimg.com/profile_images/1706532487185231872/pCmKT_CS_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1874008854335512576/K1ylxgm3_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f680.svg",
    "https://pbs.twimg.com/profile_images/1920417373221171200/84qfc8Z1_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f47e.svg",
    "https://pbs.twimg.com/profile_images/1867419774067556352/3xNSCXuY_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1868871521282015238/BIfhSuhO_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f427.svg",
    "https://pbs.twimg.com/profile_images/1918189863637045248/T63_B7SZ_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1e6-1f1f2.svg",
    "https://pbs.twimg.com/profile_images/1951619424227639296/yiO10U5t_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4a7.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/2728.svg",
    "https://pbs.twimg.com/profile_images/1891998665012584448/-xmeRAi7_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f412.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4a8.svg",
    "https://pbs.twimg.com/profile_images/1749943828994510848/zGk0ah2F_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1921283751230775296/nomIFVNF_bigger.png",
    "https://pbs.twimg.com/profile_images/1869176846740230144/4tiLT_A__bigger.jpg",
    "https://pbs.twimg.com/profile_images/1869180990784237568/py9YJpCR_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1597992524517367813/Lhm7hvV0_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1896616805763801088/hwgiuJnC_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1950200458074525696/xMetE0hS_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1832650228844937216/5ctfuv3v_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1865848202370441216/yb2SxGgS_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1697493336549122048/0_RDl_2B_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1fae1.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1f2.svg",
    "https://pbs.twimg.com/profile_images/1956092526974173184/gpEe0cQP_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1874994636889964545/jmjKbtH3_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1faac.svg",
    "https://pbs.twimg.com/profile_images/1765332124037472256/WgD_aco1_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f36a.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f960.svg",
    "https://pbs.twimg.com/profile_images/1951055576777076736/12A9543l_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f993.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/2615.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f372.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f993.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f372.svg",
    "https://pbs.twimg.com/profile_images/1915686523770724352/qm0El02V_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1967113482/Ink-meNEWa_bigger.png",
    "https://pbs.twimg.com/profile_images/1657879051338489856/Wl8Kh2W__bigger.jpg",
    "https://pbs.twimg.com/profile_images/1759081677274435584/ZYkzqjnb_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1812607050586710016/rTvGgUgS_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f1e8-1f1e6.svg",
    "https://pbs.twimg.com/profile_images/1893937295515918336/H1LuEBuL_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1771956297543426048/0qi-DI3O_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f96a.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f95e.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f525.svg",
    "https://pbs.twimg.com/profile_images/1959824830892752896/nnIb7nZJ_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f596-1f3fe.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f316.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f314.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/2764.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/2600.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f3d6.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f3a3.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f64f-1f3fe.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f9d8-1f3fe-200d-2642-fe0f.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f596-1f3fe.svg",
    "https://pbs.twimg.com/profile_images/1862688861207330817/U0XXos-3_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1794924702147973120/rDtZRLIg_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1885193346576244741/kvWeyDDT_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1913062169559621632/B6kRE9IE_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f3f4-200d-2620-fe0f.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4af.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f90d.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4a5.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f4af.svg",
    "https://pbs.twimg.com/profile_images/1904912385430745088/BIi2BNc1_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f9d7-1f3fb-200d-2642-fe0f.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f0cf.svg",
    "https://pbs.twimg.com/profile_images/1869049978301140992/1hIKZkTZ_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1589882957749174274/JIcDSdLS_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1886953566272675840/cx8-CTye_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1914528660599808000/kZMoQ9up_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1785235631347466240/luo2iI4g_bigger.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f916.svg",
    "https://abs-0.twimg.com/emoji/v2/svg/26a1.svg",
    "https://pbs.twimg.com/profile_images/1945927395443109888/JqnAzx4I_normal.jpg",
    "https://pbs.twimg.com/profile_images/1945927395443109888/JqnAzx4I_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1618814384792543232/SFymiMDK_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1512490077833900045/hiUiXrAq_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1904893649709576192/UdxwD_pe_normal.jpg",
    "https://abs-0.twimg.com/emoji/v2/svg/1f336.svg",
    "https://pbs.twimg.com/profile_images/1904893649709576192/UdxwD_pe_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1873741638972899328/fhXbXjSb_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1796742055906914305/iaLWQyB6_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1141781661551665153/BMnvVd2u_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1694331764091564032/My5iC3pg_bigger.jpg",
    "https://pbs.twimg.com/profile_images/1848143587835265024/bhuhxq3o_bigger.jpg"
]

/**
 * Processes a list of image URLs to filter out SVGs and select the bigger version of duplicates.
 * @param {string[]} urls - An array of image URLs.
 * @returns {string[]} A filtered list of URLs to download.
 */
function getDownloadUrls(urls) {
    // 1. Filter out all SVG files.
    const jpgUrls = urls.filter(url => url.endsWith('.jpg'));

    // 2. Group URLs by a common base name (e.g., 'JqnAzx4I').
    const urlMap = new Map();
    for (const url of jpgUrls) {
        const filename = path.basename(url);
        const baseName = filename.replace(/_(normal|bigger)\.jpg$/, '');
        if (!urlMap.has(baseName)) {
            urlMap.set(baseName, []);
        }
        urlMap.get(baseName).push(url);
    }

    // 3. Select the preferred version from each group.
    const selectedUrls = [];
    for (const [baseName, versions] of urlMap.entries()) {
        if (versions.length > 1) {
            // If there are multiple versions, find the one with '_bigger'.
            const biggerVersion = versions.find(v => v.includes('_bigger.jpg'));
            if (biggerVersion) {
                selectedUrls.push(biggerVersion);
            }
        } else {
            // If there's only one version, just add it.
            selectedUrls.push(versions[0]);
        }
    }

    return selectedUrls;
}

/**
 * Downloads a list of images to a specified folder.
 * @param {string[]} urls - An array of image URLs.
 * @param {string} folder - The destination folder.
 */
async function downloadImages(urls, folder) {
    try {
        // Ensure the output folder exists using Bun's new API.
        await fs.mkdir(folder, { recursive: true });
        console.log(`Ensured folder exists: ${folder}`);

        const downloadPromises = urls.map(async (url) => {
            try {
                console.log(`Downloading ${url}...`);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }

                const fileName = path.basename(url);
                const filePath = path.join(folder, fileName);

                await Bun.write(filePath, response);
                console.log(`Successfully downloaded ${fileName}`);
            } catch (error) {
                console.error(`Error downloading ${url}:`, error.message);
            }
        });

        await Promise.all(downloadPromises);
        console.log('\nAll downloads complete!');
    } catch (error) {
        console.error('An unexpected error occurred:', error.message);
    }
}

// 1. Process the original URL list to get the final download list.
const urlsToDownload = getDownloadUrls(imageUrls);

// 2. Start the download process.
downloadImages(urlsToDownload, outputFolder);