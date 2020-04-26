![CI](https://github.com/chipzoller/devtest/workflows/CI/badge.svg)

# Files for "neonmirrors" blog based on Hugo and Silhouette theme.

## Create a new article
`hugo new post/<date>/post_name.md`


## Modify Menu

To add, remove or reorganize top menu links, [edit this yaml file](./data/menu.yaml)

## Inline Images

To make an image inline, add `:inline` to its alt text.

### Example:

```markdown
<!-- some image without alt text -->
![:inline](someImageUrl)

<!-- some image with alt text -->

![some alt text:inline](someOtherImageUrl)
```
edit