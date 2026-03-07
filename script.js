// 加载并渲染数据
var siteData = null;

// 加载 data.json 文件（或使用内联数据）
async function loadData() {
    // 优先使用内联数据（如果存在，说明使用了构建脚本）
    if (window.siteData) {
        siteData = window.siteData;
        renderAll();
        return;
    }
    
    // 否则从 data.json 文件加载
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        siteData = await response.json();
        renderAll();
    } catch (error) {
        console.error('Error loading data:', error);
        // 如果加载失败，显示错误信息
        document.body.innerHTML = '<div style="padding: 2rem; text-align: center;"><h1>Error loading data</h1><p>Please make sure data.json exists and is valid.</p></div>';
    }
}

// 渲染所有内容
function renderAll() {
    renderProfile();
    renderIntroduction();
    renderEducation();
    renderNews();
    renderPublications();
    initNavigation();
}

// 渲染个人信息
function renderProfile() {
    const profile = siteData.profile;
    
    // 设置头像
    const profileImg = document.getElementById('profile-img');
    if (profileImg && profile.avatar) {
        profileImg.src = `images/${profile.avatar}`;
        profileImg.addEventListener('load', function() {
            this.classList.add('loaded');
            const placeholder = document.getElementById('profile-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        });
        profileImg.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = document.getElementById('profile-placeholder');
            if (placeholder) placeholder.style.display = 'flex';
        });
    }
    
    // 设置个人信息
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-affiliation').textContent = profile.affiliation;
    document.getElementById('profile-role').textContent = profile.role;
    
    // 设置联系方式
    const contactInfo = document.getElementById('contact-info');
    let contactHTML = `
        <div class="contact-item">
            <div class="contact-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <span>${profile.location}</span>
        </div>
        <div class="contact-item">
            <div class="contact-icon">
                <i class="fas fa-envelope"></i>
            </div>
            <a href="mailto:${profile.email}">${profile.email}</a>
        </div>`;
    
    // 如果有电话号码，添加电话号码显示
    if (profile.phone) {
        contactHTML += `
        <div class="contact-item">
            <div class="contact-icon">
                <i class="fas fa-phone"></i>
            </div>
            <a href="tel:${profile.phone}">${profile.phone}</a>
        </div>`;
    }
    
    contactHTML += `
        <div class="contact-item">
            <div class="contact-icon">
                <i class="fab fa-github"></i>
            </div>
            <a href="${profile.github}" target="_blank">Github</a>
        </div>
        <div class="contact-item">
            <div class="contact-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <a href="${profile.scholar}" target="_blank">Google Scholar</a>
        </div>
    `;
    
    contactInfo.innerHTML = contactHTML;
}

// 渲染个人介绍
function renderIntroduction() {
    document.getElementById('introduction-text').textContent = siteData.introduction;
}

// 渲染教育背景
function renderEducation() {
    const timeline = document.getElementById('education-timeline');
    timeline.innerHTML = siteData.education.map(edu => {
        let details = `${edu.institution}, ${edu.school}, ${edu.major}.`;
        if (edu.gpa || edu.ranking) {
            let extraInfo = [];
            if (edu.gpa) extraInfo.push(`GPA: ${edu.gpa}`);
            if (edu.ranking) extraInfo.push(`Ranking: ${edu.ranking}`);
            if (extraInfo.length > 0) {
                details += ` (${extraInfo.join(', ')})`;
            }
        }
        return `
        <div class="education-item">
            <div class="education-badge">${edu.degree}</div>
            <div class="education-content">
                <p class="education-period">${edu.period}</p>
                <p class="education-details">${details}</p>
            </div>
        </div>
        `;
    }).join('');
}

// 渲染新闻（自动高亮会议名称）
function renderNews() {
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = siteData.news.map(news => {
        // 自动高亮会议/期刊名称（匹配常见格式：大写字母+数字，如 AAAI 2026, EMNLP 2025）
        let content = news.content;
        // 匹配会议名称模式：2-5个大写字母 + 空格 + 4位数字
        content = content.replace(/\b([A-Z]{2,5})\s+(\d{4})\b/g, '<span class="highlight">$1 $2</span>');
        // 匹配其他格式，如 "Cells STAR Protocol 2025"
        content = content.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d{4})\b/g, '<span class="highlight">$1 $2</span>');
        
        return `
            <div class="news-item">
                <div class="news-date-badge">${news.date}</div>
                <div class="news-content">${content}</div>
            </div>
        `;
    }).join('');
}

// 渲染出版物
function renderPublications() {
    const publicationsList = document.getElementById('publications-list');
    publicationsList.innerHTML = siteData.publications.map((pub, index) => {
        const thumbnail = pub.thumbnail ? 
            `<img src="images/${pub.thumbnail}" alt="Publication thumbnail" class="thumbnail-image" data-index="${index}" onerror="this.parentElement.innerHTML='<div class=\\'thumbnail-placeholder\\'><i class=\\'fas fa-file-pdf\\'></i></div>'">` :
            `<div class="thumbnail-placeholder"><i class="fas fa-file-pdf"></i></div>`;
        
        const links = [];
        if (pub.code && pub.code !== '#') {
            links.push(`<a href="${pub.code}" class="code-link" target="_blank"><i class="fab fa-github"></i> Code</a>`);
        }
        
        return `
            <div class="publication-item">
                <div class="publication-thumbnail">
                    ${thumbnail}
                </div>
                <div class="publication-content">
                    <h3 class="publication-title">${pub.title}</h3>
                    <div class="publication-meta">
                        <span class="publication-venue">${pub.venue}</span>
                    </div>
                    <p class="publication-authors">${pub.authors}</p>
                    ${links.length > 0 ? `<div class="publication-links">${links.join('')}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // 添加图片点击放大功能
    initImageLightbox();
}

// 初始化图片放大功能
function initImageLightbox() {
    const thumbnailImages = document.querySelectorAll('.thumbnail-image');
    
    thumbnailImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            showImageModal(this.src);
        });
    });
}

// 显示图片模态框
function showImageModal(imageSrc) {
    // 创建模态框
    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-modal-close">&times;</span>
                <img src="" alt="Enlarged image" class="image-modal-img">
            </div>
        `;
        document.body.appendChild(modal);
        
        // 关闭按钮事件
        modal.querySelector('.image-modal-close').addEventListener('click', closeImageModal);
        // 点击背景关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
        // ESC 键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeImageModal();
            }
        });
    }
    
    // 显示图片
    modal.querySelector('.image-modal-img').src = imageSrc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭图片模态框
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复滚动
    }
}

// 初始化导航功能
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    // 平滑滚动
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const offset = 100;
                    const targetPosition = targetSection.offsetTop - offset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }

            // 更新激活状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 根据滚动位置更新激活状态
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // 如果在顶部，激活 Homepage 链接
        if (window.scrollY < 100) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

// 页面加载完成后加载数据（如果没有内联数据）
// 注意：如果有内联数据，会在 index.html 的内联脚本中直接调用
if (!window.siteData) {
    document.addEventListener('DOMContentLoaded', function() {
        loadData();
    });
}

// ===== 樱花瓣特效 =====
function createCherryBlossomEffect() {
    const container = document.getElementById('cherry-blossom-container');
    if (!container) return;

    // 花瓣数量
    const petalCount = 15;
    const petals = [];

    // 创建花瓣
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'cherry-petal';
        
        // 随机大小
        const size = Math.random();
        if (size < 0.3) {
            petal.classList.add('petal-small');
        } else if (size > 0.7) {
            petal.classList.add('petal-large');
        }
        
        // 随机起始位置（在头像上方）
        const startX = (Math.random() - 0.5) * 180; // 头像宽度范围内
        petal.style.left = `calc(50% + ${startX}px)`;
        petal.style.top = '-20px';
        
        // 随机飘落时间和横向漂移
        const duration = 3 + Math.random() * 4; // 3-7秒
        const driftX = (Math.random() - 0.5) * 100; // -50px 到 50px
        petal.style.setProperty('--drift-x', `${driftX}px`);
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${Math.random() * 2}s`;
        
        container.appendChild(petal);
        petals.push(petal);
        
        // 动画结束后移除花瓣并创建新的
        setTimeout(() => {
            if (petal.parentNode) {
                petal.remove();
                createPetal();
            }
        }, (duration + 2) * 1000);
    }

    // 初始化花瓣
    for (let i = 0; i < petalCount; i++) {
        setTimeout(() => {
            createPetal();
        }, i * 200); // 错开创建时间
    }
}

// 等待DOM加载完成后初始化樱花瓣特效
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCherryBlossomEffect);
} else {
    createCherryBlossomEffect();
}
